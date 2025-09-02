import { NextRequest, NextResponse } from "next/server";

const CLOUDINARY_CONFIG = {
  cloudName: "produckapp",
  apiKey: "192645388792962",
  apiSecret: "eV-GdhkoAW-dsiSFbGY9ep1bPZw",
  folder: "sendProps",
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
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
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
      {
        method: "POST",
        body: uploadData,
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Cloudinary upload failed:", error);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("Error in cloudinary upload:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function generateSignature(timestamp: number): string {
  const crypto = require("crypto");
  const params = {
    folder: CLOUDINARY_CONFIG.folder,
    timestamp: timestamp,
  };

  // Create the string to sign
  const signString =
    Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key as keyof typeof params]}`)
      .join("&") + CLOUDINARY_CONFIG.apiSecret;

  // Generate SHA1 hash
  return crypto.createHash("sha1").update(signString).digest("hex");
}
