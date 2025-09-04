import { NextRequest, NextResponse } from 'next/server';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import csv from 'csv-parser';
import { Readable } from 'stream';

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDg7eFD9bFN4-D4vONrsCybG4L1TTwhrvs",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "skill-trait-rwubkx.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "skill-trait-rwubkx",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "skill-trait-rwubkx.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "758643500464",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:758643500464:web:834dcc4973420aad3c2275",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);



// Helper function to extract text from CSV
const extractCSVText = (buffer: Buffer): Promise<string> => {
  return new Promise((resolve, reject) => {
    const results: string[] = [];
    const stream = Readable.from(buffer);
    
    stream
      .pipe(csv())
      .on('data', (data) => {
        // Join all values in the row with spaces
        const rowText = Object.values(data).join(' ');
        results.push(rowText);
      })
      .on('end', () => {
        resolve(results.join('\n'));
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

// Helper function to extract text from DOCX
const extractDOCXText = async (buffer: Buffer): Promise<string> => {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    throw new Error('Failed to parse DOCX file');
  }
};

// Helper function to extract text from XLSX
const extractXLSXText = (buffer: Buffer): string => {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const results: string[] = [];
    
    // Process all sheets
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Convert each row to text
      jsonData.forEach((row: any) => {
        if (Array.isArray(row)) {
          const rowText = row.filter(cell => cell !== null && cell !== undefined).join(' ');
          if (rowText.trim()) {
            results.push(rowText);
          }
        }
      });
    });
    
    return results.join('\n');
  } catch (error) {
    throw new Error('Failed to parse XLSX file');
  }
};

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    try {
      // Verify the token using Firebase client SDK
      const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseConfig.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: token
        })
      });
      
      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error('Invalid token');
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file size
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Check file type
    const allowedTypes = [
      'text/csv',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only CSV, DOCX, and XLSX files are allowed.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    let extractedText = '';

    // Extract text based on file type
    if (file.type === 'text/csv') {
      extractedText = await extractCSVText(buffer);
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      extractedText = await extractDOCXText(buffer);
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
               file.type === 'application/vnd.ms-excel') {
      extractedText = extractXLSXText(buffer);
    }

    // Return the extracted text
    return NextResponse.json({ text: extractedText });

  } catch (error) {
    console.error('Error parsing file:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to parse file' },
      { status: 500 }
    );
  }
}
