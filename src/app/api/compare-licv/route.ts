import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    console.log('API route called');
    
    const formData = await request.formData();
    const linkedinContent = formData.get('linkedinContent') as string;
    const resumeText = formData.get('resumeText') as string;

    console.log('LinkedIn Content length:', linkedinContent?.length);
    console.log('Resume text length:', resumeText?.length);

    if (!linkedinContent) {
      console.log('Missing LinkedIn content');
      return NextResponse.json(
        { error: 'LinkedIn profile content is required' },
        { status: 400 }
      );
    }

    if (!resumeText) {
      console.log('Missing resume content');
      return NextResponse.json(
        { error: 'Resume text is required. Please copy and paste the text from your PDF manually.' },
        { status: 400 }
      );
    }

    // Use text-based comparison
    console.log('Using text-based comparison...');
    const linkedinProfileData = {
      pastedContent: linkedinContent,
      source: 'user_pasted'
    };

    // Create the prompt for ChatGPT with LinkedIn profile data
    const prompt = `Compare the resume text to the LinkedIn profile data and provide me with comparison percentages. Review alignment across the following categories: work history, job titles, dates, accomplishments, skills, education and tone. Provide a consistency summary based on these criteria.

LinkedIn Profile Data: ${JSON.stringify(linkedinProfileData, null, 2)}
Resume Content: ${resumeText}

Please provide a detailed analysis with percentages for each category and an overall consistency score.`;

    console.log('Calling OpenAI with LinkedIn profile data...');
    
    // Call ChatGPT
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert HR professional and resume analyst. Provide detailed, professional analysis of resume and LinkedIn profile consistency."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.3,
    });

    const result = completion.choices[0]?.message?.content || 'No response generated';
    console.log('OpenAI response received, length:', result.length);

    return NextResponse.json({ result });

  } catch (error) {
    console.error('Error in compare-licv API:', error);
    return NextResponse.json(
      { error: `Failed to process comparison: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 