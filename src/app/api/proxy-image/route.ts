import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
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
      },
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

    // Verify the blob is not empty
    if (imageBlob.size === 0) {
      console.error("Empty image blob received");
      return NextResponse.json(
        { error: "Empty image received" },
        { status: 400 }
      );
    }

    console.log("Successfully proxied image, size:", imageBlob.size);

    // Return the image with proper headers
    return new NextResponse(imageBlob, {
      status: 200,
      headers: {
        "Content-Type": response.headers.get("content-type") || "image/png",
        "Cache-Control": "public, max-age=3600",
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
