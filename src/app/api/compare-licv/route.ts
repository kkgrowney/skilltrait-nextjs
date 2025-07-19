import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    console.log('API route called');
    
    const formData = await request.formData();
    const linkedinUrl = formData.get('linkedinUrl') as string;
    const resumeText = formData.get('resumeText') as string;

    console.log('LinkedIn URL:', linkedinUrl);
    console.log('Resume text length:', resumeText?.length);

    if (!linkedinUrl || !resumeText) {
      console.log('Missing required fields');
      return NextResponse.json(
        { error: 'LinkedIn URL and resume text are required' },
        { status: 400 }
      );
    }

    console.log('Processing resume text...');

    // Create the prompt for ChatGPT
    const prompt = `Compare the resume text to the LinkedIn URL and provide me with comparison percentages. Review alignment across the following categories: work history, job titles, dates, accomplishments, skills, education and tone. Provide a consistency summary based on these criteria.

LinkedIn URL: ${linkedinUrl}
Resume Content: ${resumeText}

Please provide a detailed analysis with percentages for each category and an overall consistency score.`;

    console.log('Calling OpenAI...');
    
    // Call ChatGPT
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
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