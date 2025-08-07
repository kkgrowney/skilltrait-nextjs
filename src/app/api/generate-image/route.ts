import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Check if this is a user/prop request or a completed prop request
    const userId = searchParams.get("user");
    const propId = searchParams.get("prop");

    if (userId && propId) {
      // Handle user/prop request
      const cloudFunctionUrl = `https://us-central1-skill-trait-rwubkx.cloudfunctions.net/imageGeneration?user=${userId}&prop=${propId}`;

      console.log("Proxying user/prop request to:", cloudFunctionUrl);

      const response = await fetch(cloudFunctionUrl, {
        method: "GET",
        headers: {
          Accept: "image/png",
        },
      });

      if (!response.ok) {
        console.error(
          "Cloud function response:",
          response.status,
          response.statusText
        );
        return NextResponse.json(
          {
            error: `Failed to generate image: ${response.status} - ${response.statusText}`,
          },
          { status: response.status }
        );
      }

      // Check if the response is actually an image
      const contentType = response.headers.get("content-type");
      console.log("Response content-type:", contentType);

      if (!contentType || !contentType.includes("image")) {
        // If it's not an image, try to get the error message
        const textResponse = await response.text();
        console.error("Non-image response from cloud function:", textResponse);
        return NextResponse.json(
          {
            error: "Cloud function returned non-image response",
            details: textResponse,
          },
          { status: 400 }
        );
      }

      // Get the image as blob
      const imageBlob = await response.blob();

      // Verify the blob is not empty
      if (imageBlob.size === 0) {
        console.error("Empty image blob received from cloud function");
        return NextResponse.json(
          {
            error: "Cloud function returned empty image",
          },
          { status: 400 }
        );
      }

      console.log("Successfully received image blob, size:", imageBlob.size);

      // Return the image with proper headers
      return new NextResponse(imageBlob, {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=3600",
        },
      });
    } else {
      // Handle completed prop request with rec, message, sen, com, cat, tem, tid parameters
      const rec = searchParams.get("rec");
      const message = searchParams.get("message");
      const sen = searchParams.get("sen");
      const com = searchParams.get("com");
      const cat = searchParams.get("cat");
      const tem = searchParams.get("tem");
      const tid = searchParams.get("tid");

      if (!rec || !message || !sen || !com || !cat || !tem || !tid) {
        return NextResponse.json(
          {
            error: "Missing required parameters for completed prop generation",
          },
          { status: 400 }
        );
      }

      const cloudFunctionUrl = `https://us-central1-skill-trait-rwubkx.cloudfunctions.net/imageGeneration?rec=${rec}&message=${message}&sen=${sen}&com=${com}&cat=${cat}&tem=${tem}&tid=${tid}`;

      console.log("Proxying completed prop request to:", cloudFunctionUrl);

      const response = await fetch(cloudFunctionUrl, {
        method: "GET",
        headers: {
          Accept: "image/png",
        },
      });

      if (!response.ok) {
        console.error(
          "Cloud function response:",
          response.status,
          response.statusText
        );
        return NextResponse.json(
          {
            error: `Failed to generate image: ${response.status} - ${response.statusText}`,
          },
          { status: response.status }
        );
      }

      // Check if the response is actually an image
      const contentType = response.headers.get("content-type");
      console.log("Response content-type:", contentType);

      if (!contentType || !contentType.includes("image")) {
        // If it's not an image, try to get the error message
        const textResponse = await response.text();
        console.error("Non-image response from cloud function:", textResponse);
        return NextResponse.json(
          {
            error: "Cloud function returned non-image response",
            details: textResponse,
          },
          { status: 400 }
        );
      }

      // Get the image as blob
      const imageBlob = await response.blob();

      // Verify the blob is not empty
      if (imageBlob.size === 0) {
        console.error("Empty image blob received from cloud function");
        return NextResponse.json(
          {
            error: "Cloud function returned empty image",
          },
          { status: 400 }
        );
      }

      console.log("Successfully received image blob, size:", imageBlob.size);

      // Return the image with proper headers
      return new NextResponse(imageBlob, {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }
  } catch (error) {
    console.error("Error in generate-image API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
