import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const requestBody = await request.json();
    
    console.log("Get skills API route received request:", requestBody);
    
    // Validate required fields
    const { value } = requestBody;
    
    if (!value) {
      return NextResponse.json(
        {
          error: "Missing required parameter: value",
          received: { value }
        },
        { status: 400 }
      );
    }
    
    // Proxy the request to the cloud function
    const cloudFunctionUrl = 'https://us-central1-skill-trait-rwubkx.cloudfunctions.net/getSkillsForWebsite';
    
    console.log("Proxying get skills request to:", cloudFunctionUrl);
    console.log("Request body:", requestBody);
    
    // Convert JSON to form-encoded data (like the original implementation)
    const urlencoded = new URLSearchParams();
    urlencoded.append("value", requestBody.value);
    
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
      console.error("Cloud function response:", response.status, response.statusText);
      
      // Try to get error details from response
      let errorDetails = '';
      try {
        errorDetails = await response.text();
      } catch (e) {
        errorDetails = 'No error details available';
      }
      
      return NextResponse.json(
        {
          error: `Cloud function error: ${response.status} - ${response.statusText}`,
          details: errorDetails,
        },
        { status: response.status }
      );
    }
    
    // Get the response from cloud function
    let result;
    try {
      result = await response.text();
    } catch (e) {
      console.error("Error reading response as text:", e);
      return NextResponse.json(
        {
          error: "Failed to read response from cloud function",
        },
        { status: 500 }
      );
    }
    
    console.log("Successfully received response from cloud function:", result);
    
    // Return the response from cloud function
    return NextResponse.json({ 
      success: true,
      skills: result 
    }, { status: 200 });

  } catch (error) {
    console.error("Error in get-skills API route:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
