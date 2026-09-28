import { logger } from "@/lib/logger";

import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";

import {
  admitRequest,
  fetchWithTimeout,
  requireFirebaseUser,
} from "@/lib/server/apiSecurity";

const CLOUDINARY_CONFIG = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
  folder: process.env.CLOUDINARY_UPLOAD_FOLDER || "sendProps",
};

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: NextRequest) {
  const admission = admitRequest(request, {
    route: "cloudinary-upload",
    maxRequests: 10,
    windowMs: 60_000,
    maxConcurrent: 3,
    maxBodyBytes: MAX_UPLOAD_BYTES + 256 * 1024,
  });
  if (admission instanceof NextResponse) return admission;

  try {
    const user = await requireFirebaseUser(request);
    if (user instanceof NextResponse) return user;
    if (
      !CLOUDINARY_CONFIG.cloudName ||
      !CLOUDINARY_CONFIG.apiKey ||
      !CLOUDINARY_CONFIG.apiSecret
    ) {
      return NextResponse.json(
        { error: "Image uploads are not configured" },
        { status: 503 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "Image exceeds the 5MB limit" }, { status: 413 });
    }
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Unsupported image type" }, { status: 415 });
    }

    // Convert file to base64 for Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataURI = `data:${file.type};base64,${base64}`;

    // Create the upload signature
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = generateSignature(timestamp);

    // Prepare upload data
    const uploadData = new FormData();
    uploadData.append("file", dataURI);
    uploadData.append("timestamp", timestamp.toString());
    uploadData.append("signature", signature);
    uploadData.append("api_key", CLOUDINARY_CONFIG.apiKey);
    uploadData.append("folder", CLOUDINARY_CONFIG.folder);

    // Upload to Cloudinary
    const response = await fetchWithTimeout(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
      {
        method: "POST",
        body: uploadData,
      },
      15_000,
    );

    if (!response.ok) {
      return NextResponse.json({ error: "Upload failed" }, { status: 502 });
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    logger.error("Cloudinary upload failed", {
      error: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    admission.release();
  }
}

function generateSignature(timestamp: number): string {
  const params = {
    folder: CLOUDINARY_CONFIG.folder,
    timestamp: timestamp,
  };

  // Create the string to sign
  const signString =
    Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key as keyof typeof params]}`)
    .join("&") + CLOUDINARY_CONFIG.apiSecret!;

  // Generate SHA1 hash
  return createHash("sha1").update(signString).digest("hex");
}
