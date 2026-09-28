import { logger } from "@/lib/logger";

import { NextRequest, NextResponse } from 'next/server';
import { admitRequest, requireFirebaseUser } from '@/lib/server/apiSecurity';

const MAX_PDF_BYTES = 10 * 1024 * 1024;

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function POST(request: NextRequest) {
  const admission = admitRequest(request, {
    route: 'upload-pdf',
    maxRequests: 10,
    windowMs: 60_000,
    maxConcurrent: 2,
    maxBodyBytes: MAX_PDF_BYTES + 256 * 1024,
  });
  if (admission instanceof NextResponse) return admission;
  try {
    const user = await requireFirebaseUser(request);
    if (user instanceof NextResponse) return user;
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Check if it's a PDF
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 });
    }

    // Check file size (limit to 10MB)
    if (file.size > MAX_PDF_BYTES) {
      return NextResponse.json({
        error: 'File size too large. Please upload a PDF smaller than 10MB.'
      }, { status: 400 });
    }

    // Convert file to buffer for pdf-parse
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Try to extract text from PDF
    try {
      // Dynamic import to avoid initialization issues
      const pdfParse = (await import('pdf-parse')).default;
      const data = await pdfParse(buffer);
      const extractedText = data.text;

      if (!extractedText || extractedText.trim().length === 0) {
        return NextResponse.json({
          success: true,
          message: 'PDF validated successfully! Please copy the text from your PDF and paste it in the text area below.',
          fileName: file.name,
          fileSize: file.size,
          extractedText: '',
          note: 'Could not extract text automatically. Please copy and paste manually.'
        });
      }

    return NextResponse.json({
      success: true,
        message: 'PDF text extracted successfully!',
      fileName: file.name,
        fileSize: file.size,
        extractedText: extractedText.trim()
      });

    } catch (parseError) {
      logger.error('PDF parsing error:', parseError);

      // If parsing fails, still validate the PDF and provide guidance
      return NextResponse.json({
        success: true,
        message: 'PDF validated successfully! Please copy the text from your PDF and paste it in the text area below.',
        fileName: file.name,
        fileSize: file.size,
        extractedText: '',
        note: 'Automatic text extraction failed. Please copy and paste the text manually.'
      });
    }

  } catch (error) {
    logger.error('Error processing PDF:', error);
    return NextResponse.json(
      { error: 'Failed to process PDF file. Please ensure the file is a valid PDF.' },
      { status: 500 }
    );
  } finally {
    admission.release();
  }
}
