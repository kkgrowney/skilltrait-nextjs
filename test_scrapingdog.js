const fs = require('fs');

// Scrapingdog API configuration
const SCRAPINGDOG_API_KEY = '687d31c53590bd2380dbcbad';
const SCRAPINGDOG_BASE_URL = 'https://api.scrapingdog.com/linkedin';

// Function to extract LinkedIn profile ID from URL
function extractLinkedInProfileId(url) {
  const match = url.match(/linkedin\.com\/in\/([^\/\?]+)/);
  return match ? match[1] : null;
}

// Function to fetch LinkedIn profile data from Scrapingdog
async function fetchLinkedInProfile(profileId) {
  try {
    const url = `${SCRAPINGDOG_BASE_URL}?api_key=${SCRAPINGDOG_API_KEY}&type=profile&linkId=${profileId}&premium=true`;
    console.log('Fetching LinkedIn profile from Scrapingdog...');
    console.log('URL:', url);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Scrapingdog API error: ${data.message || response.statusText}`);
    }
    
    console.log('LinkedIn profile data fetched successfully');
    return data;
  } catch (error) {
    console.error('Error fetching LinkedIn profile:', error);
    throw error;
  }
}

// Main function
async function testScrapingdogAPI() {
  const linkedinUrl = 'https://www.linkedin.com/in/kevingrowney/';
  
  console.log('Testing Scrapingdog API...');
  console.log('LinkedIn URL:', linkedinUrl);
  
  // Extract LinkedIn profile ID
  const profileId = extractLinkedInProfileId(linkedinUrl);
  if (!profileId) {
    console.error('Invalid LinkedIn URL format');
    return;
  }

  console.log('LinkedIn Profile ID:', profileId);
  
  try {
    // Fetch LinkedIn profile data from Scrapingdog
    const linkedinProfileData = await fetchLinkedInProfile(profileId);
    
    console.log('LinkedIn profile data received:', Object.keys(linkedinProfileData));
    console.log('Full LinkedIn profile data:', JSON.stringify(linkedinProfileData, null, 2));
    
    // Save the data to a text file
    const outputData = {
      timestamp: new Date().toISOString(),
      linkedinUrl: linkedinUrl,
      profileId: profileId,
      apiResponse: linkedinProfileData
    };
    
    const filename = `scrapingdog_response_${profileId}_${Date.now()}.txt`;
    fs.writeFileSync(filename, JSON.stringify(outputData, null, 2));
    
    console.log(`Data saved to: ${filename}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the test
testScrapingdogAPI(); 