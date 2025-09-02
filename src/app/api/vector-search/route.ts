import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const requestBody = await request.json();
    
    console.log("Vector search API route received request:", requestBody);
    
    // Validate required fields
    const { query, comp, mot, prof } = requestBody;
    
    if (!query || !comp || mot === undefined || prof === undefined) {
      return NextResponse.json(
        {
          error: "Missing required parameters: query, comp, mot, prof",
          received: { query, comp, mot, prof }
        },
        { status: 400 }
      );
    }
    
    // Proxy the request to the cloud function
    const cloudFunctionUrl = 'https://us-central1-skill-trait-rwubkx.cloudfunctions.net/vectorSearch';
    
    console.log("Proxying vector search request to:", cloudFunctionUrl);
    console.log("Request body:", requestBody);
    console.log("Request body type:", typeof requestBody);
    console.log("JSON stringified body:", JSON.stringify(requestBody));
    console.log("JSON stringified body type:", typeof JSON.stringify(requestBody));
    
    console.log("About to make fetch request to cloud function...");
    
    // Convert JSON to form-encoded data (like Postman)
    const urlencoded = new URLSearchParams();
    urlencoded.append("query", requestBody.query);
    urlencoded.append("comp", requestBody.comp);
    urlencoded.append("mot", requestBody.mot.toString());
    urlencoded.append("prof", requestBody.prof.toString());
    
    console.log("Form-encoded body:", urlencoded.toString());
    
    const response = await fetch(cloudFunctionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: urlencoded
    });
    
    console.log("Fetch response received:", response.status, response.statusText);
    
    if (!response.ok) {
      console.error(
        "Cloud function response:",
        response.status,
        response.statusText
      );
      
      // Try to get error details from response
      let errorDetails = "";
      try {
        errorDetails = await response.text();
      } catch (e) {
        errorDetails = "Could not read error details";
      }
      
      return NextResponse.json(
        {
          error: `Cloud function failed: ${response.status} - ${response.statusText}`,
          details: errorDetails
        },
        { status: response.status }
      );
    }
    
    // Get the response data
    const responseData = await response.json();
    
    console.log("Successfully received response from cloud function:", responseData);
    
    // Return the response with proper headers
    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    });
    
  } catch (error) {
    console.error("Error in vector-search API route:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
