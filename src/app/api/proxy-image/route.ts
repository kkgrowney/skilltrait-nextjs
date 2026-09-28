import { logger } from "@/lib/logger";

import { NextRequest, NextResponse } from "next/server";

import { admitRequest, fetchWithTimeout } from "@/lib/server/apiSecurity";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const DEFAULT_ALLOWED_HOSTS = [
  "firebasestorage.googleapis.com",
  "storage.googleapis.com",
  "res.cloudinary.com",
];

function allowedHosts() {
  return new Set([
    ...DEFAULT_ALLOWED_HOSTS,
    ...(process.env.IMAGE_PROXY_ALLOWED_HOSTS || "")
      .split(",")
      .map((host) => host.trim().toLowerCase())
      .filter(Boolean),
  ]);
}

function safeImageUrl(raw: string): URL | null {
  try {
    const url = new URL(raw);
    if (
      url.protocol !== "https:" || url.username || url.password || url.port ||
      !allowedHosts().has(url.hostname.toLowerCase())
    ) return null;
    return url;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const admission = admitRequest(request, {
    route: "proxy-image",
    maxRequests: 120,
    windowMs: 60_000,
    maxConcurrent: 10,
  });
  if (admission instanceof NextResponse) return admission;
  try {
    const rawUrl = request.nextUrl.searchParams.get("url");
    const imageUrl = rawUrl ? safeImageUrl(rawUrl) : null;
    if (!imageUrl) return NextResponse.json({ error: "Image host is not allowed" }, { status: 400 });
    const response = await fetchWithTimeout(
      imageUrl,
      { headers: { Accept: "image/*" }, redirect: "error" },
      8_000,
    );
    if (!response.ok) return NextResponse.json({ error: "Image fetch failed" }, { status: 502 });
    const contentType = response.headers.get("content-type") || "";
    const contentLength = Number(response.headers.get("content-length") || "0");
    if (!contentType.startsWith("image/") || contentLength > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "Invalid image response" }, { status: 415 });
    }
    const bytes = await response.arrayBuffer();
    if (!bytes.byteLength || bytes.byteLength > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "Invalid image size" }, { status: 413 });
    }
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    logger.error("Image proxy failed", { error: error instanceof Error ? error.message : "unknown" });
    return NextResponse.json({ error: "Image fetch failed" }, { status: 502 });
  } finally {
    admission.release();
  }
}
