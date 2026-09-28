import { logger } from "@/lib/logger";

import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc } from "firebase/firestore";

import { db } from "@/lib/firebase";
import { admitRequest, fetchWithTimeout, requireFirebaseUser } from "@/lib/server/apiSecurity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const IMAGE_FUNCTION = "https://us-central1-skill-trait-rwubkx.cloudfunctions.net/imageGeneration";

export async function GET(request: NextRequest) {
  const admission = admitRequest(request, {
    route: "generate-image",
    maxRequests: 10,
    windowMs: 60_000,
    maxConcurrent: 2,
  });
  if (admission instanceof NextResponse) return admission;
  try {
    const authenticatedUser = await requireFirebaseUser(request);
    if (authenticatedUser instanceof NextResponse) return authenticatedUser;
    const userId = request.nextUrl.searchParams.get("user");
    const propId = request.nextUrl.searchParams.get("prop");
    if (!userId || !propId || userId !== authenticatedUser.localId) {
      return NextResponse.json({ error: "Invalid image request" }, { status: 400 });
    }
    const propDoc = await getDoc(doc(db, "users", userId, "props", propId));
    if (!propDoc.exists()) return NextResponse.json({ error: "Prop not found" }, { status: 404 });
    const response = await fetchWithTimeout(
      IMAGE_FUNCTION,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "image/png" },
        body: JSON.stringify({ userId, propId, propData: propDoc.data() }),
      },
      20_000,
    );
    const contentType = response.headers.get("content-type") || "";
    if (!response.ok || !contentType.startsWith("image/")) {
      return NextResponse.json({ error: "Image generation failed" }, { status: 502 });
    }
    const bytes = await response.arrayBuffer();
    if (!bytes.byteLength || bytes.byteLength > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Invalid generated image" }, { status: 502 });
    }
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    logger.error("Image generation failed", { error: error instanceof Error ? error.message : "unknown" });
    return NextResponse.json({ error: "Image generation failed" }, { status: 500 });
  } finally {
    admission.release();
  }
}
