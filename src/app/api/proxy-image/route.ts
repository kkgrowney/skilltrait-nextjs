import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Add a test endpoint
  const { searchParams } = new URL(request.url);
  const test = searchParams.get("test");
  
  if (test === "ping") {
    return NextResponse.json({ message: "Proxy is working!", timestamp: new Date().toISOString() });
  }
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get("url");

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Missing image URL parameter" },
        { status: 400 }
      );
    }

    console.log("Proxying image from:", imageUrl);

    // Fetch the image from Firebase Storage
    const response = await fetch(imageUrl, {
      method: "GET",
      headers: {
        Accept: "image/*",
        "User-Agent": "Mozilla/5.0 (compatible; SkillTrait-Proxy/1.0)",
      },
      redirect: "follow", // Follow redirects
    });

    if (!response.ok) {
      console.error(
        "Failed to fetch image:",
        response.status,
        response.statusText
      );
      return NextResponse.json(
        {
          error: `Failed to fetch image: ${response.status} - ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    // Get the image as blob
    const imageBlob = await response.blob();

    // Log response details for debugging
    console.log("Response details:", {
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get("content-type"),
      contentLength: response.headers.get("content-length"),
      blobSize: imageBlob.size,
      url: imageUrl
    });

    // Verify the blob is not empty
    if (imageBlob.size === 0) {
      console.error("Empty image blob received from:", imageUrl);
      return NextResponse.json(
        { error: "Empty image received" },
        { status: 400 }
      );
    }

    console.log("Successfully proxied image, size:", imageBlob.size, "from:", imageUrl);

    // Return the image with proper headers
    return new NextResponse(imageBlob, {
      status: 200,
      headers: {
        "Content-Type": response.headers.get("content-type") || "image/png",
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*", // Ensure CORS works
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Accept, Content-Type",
      },
    });
  } catch (error) {
    console.error("Error in proxy-image API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
