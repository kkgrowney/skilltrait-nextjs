import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Get the skill data from the request body
    const skillData = await request.json();
    
    console.log("Proxying save-skill request to cloud function with data:", skillData);

    // Validate required fields
    if (!skillData.user || !skillData.name) {
      return NextResponse.json(
        {
          error: "Missing required parameters: user and name",
        },
        { status: 400 }
      );
    }

    // Call the cloud function
    const cloudFunctionUrl = 'https://us-central1-skill-trait-rwubkx.cloudfunctions.net/saveSkill';
    
    const response = await fetch(cloudFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(skillData),
    });

    if (!response.ok) {
      console.error(
        "Cloud function response:",
        response.status,
        response.statusText
      );
      
      // Try to get error details from response
      let errorDetails = '';
      try {
        errorDetails = await response.text();
      } catch (e) {
        errorDetails = 'No error details available';
      }
      
      return NextResponse.json(
        {
          error: `Failed to save skill: ${response.status} - ${response.statusText}`,
          details: errorDetails,
        },
        { status: response.status }
      );
    }

    // Get the response from cloud function
    let result;
    try {
      result = await response.json();
    } catch (e) {
      // If response is not JSON, get as text
      result = await response.text();
    }

    console.log("Successfully received response from cloud function:", result);

    // Return the response from cloud function
    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error("Error in save-skill API route:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
