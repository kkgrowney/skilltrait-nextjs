import { NextRequest, NextResponse } from "next/server";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyDg7eFD9bFN4-D4vONrsCybG4L1TTwhrvs",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "skill-trait-rwubkx.firebaseapp.com",
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "skill-trait-rwubkx",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "skill-trait-rwubkx.appspot.com",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "758643500464",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:758643500464:web:834dcc4973420aad3c2275",
  measurementId: "G-R0C17N4NG6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Only handle user/prop requests - all image generation should use this approach
    const userId = searchParams.get("user");
    const propId = searchParams.get("prop");

    if (!userId || !propId) {
      return NextResponse.json(
        {
          error: "Missing required parameters: user and prop",
        },
        { status: 400 }
      );
    }

    // First, get the prop data from Firestore
    console.log("Fetching prop data for:", userId, propId);
    const propDocRef = doc(db, "users", userId, "props", propId);
    const propDoc = await getDoc(propDocRef);

    if (!propDoc.exists()) {
      console.error("Prop document not found:", propId);
      return NextResponse.json(
        {
          error: "Prop document not found",
        },
        { status: 404 }
      );
    }

    const propData = propDoc.data();
    console.log("Prop data retrieved:", propData);

    // Handle user/prop request with complete data
    // Try POST first, if it fails, fall back to GET with query params
    const cloudFunctionUrl = `https://us-central1-skill-trait-rwubkx.cloudfunctions.net/imageGeneration`;

    // Prepare the data payload
    const payload = {
      userId,
      propId,
      propData,
    };

    console.log("Sending prop data to cloud function:", cloudFunctionUrl);
    console.log("Payload being sent:", JSON.stringify(payload, null, 2));

    let response;
    try {
      // Try POST first
      response = await fetch(cloudFunctionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "image/png",
        },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.log("POST failed, trying GET with query params:", error);

      // Fall back to GET with query params (original method)
      const queryParams = new URLSearchParams({
        user: userId,
        prop: propId,
      });

      const getUrl = `${cloudFunctionUrl}?${queryParams.toString()}`;
      console.log("Trying GET request to:", getUrl);

      response = await fetch(getUrl, {
        method: "GET",
        headers: {
          Accept: "image/png",
        },
      });
    }

    if (!response.ok) {
      console.error(
        "Cloud function response:",
        response.status,
        response.statusText
      );

      // Try to get error details from response
      let errorDetails = "";
      try {
        const errorResponse = await response.text();
        errorDetails = errorResponse;
      } catch (e) {
        errorDetails = "No error details available";
      }

      console.error("Error details:", errorDetails);

      return NextResponse.json(
        {
          error: `Failed to generate image: ${response.status} - ${response.statusText}`,
          details: errorDetails,
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
      console.error("Expected image but got:", contentType);
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
  } catch (error) {
    console.error("Error in generate-image API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
