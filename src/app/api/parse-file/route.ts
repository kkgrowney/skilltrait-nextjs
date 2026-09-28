import { logger } from "@/lib/logger";

import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";
import csv from "csv-parser";
import { Readable } from "stream";
import readXlsxFile from "read-excel-file/node";

import { admitRequest, requireFirebaseUser } from "@/lib/server/apiSecurity";

// Prevent this API route from being prerendered
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_BYTES = 10 * 1024 * 1024;

// Helper function to extract text from CSV
const extractCSVText = (buffer: Buffer): Promise<string> => {
  return new Promise((resolve, reject) => {
    const results: string[] = [];
    const stream = Readable.from(buffer);

    stream
      .pipe(csv())
      .on("data", (data) => {
        // Join all values in the row with spaces
        const rowText = Object.values(data).join(" ");
        results.push(rowText);
      })
      .on("end", () => {
        resolve(results.join("\n"));
      })
      .on("error", (error) => {
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
    throw new Error("Failed to parse DOCX file");
  }
};

// Helper function to extract text from XLSX
const extractXLSXText = async (buffer: Buffer): Promise<string> => {
  try {
    const sheets = await readXlsxFile(buffer);
    return sheets
      .flatMap((sheet) => sheet.data)
      .map((row) => row.filter((cell) => cell !== null).join(" ").trim())
      .filter(Boolean)
      .join("\n");
  } catch (error) {
    throw new Error("Failed to parse XLSX file");
  }
};

export async function POST(request: NextRequest) {
  const admission = admitRequest(request, {
    route: "parse-file",
    maxRequests: 10,
    windowMs: 60_000,
    maxConcurrent: 2,
    maxBodyBytes: MAX_FILE_BYTES + 256 * 1024,
  });
  if (admission instanceof NextResponse) return admission;
  try {
    const user = await requireFirebaseUser(request);
    if (user instanceof NextResponse) return user;

    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Check file size
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // Check file type
    const allowedTypes = [
      "text/csv",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Only CSV, DOCX, and XLSX files are allowed.",
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    let extractedText = "";

    // Extract text based on file type
    if (file.type === "text/csv") {
      extractedText = await extractCSVText(buffer);
    } else if (
      file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      extractedText = await extractDOCXText(buffer);
    } else if (
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      extractedText = await extractXLSXText(buffer);
    }

    // Return the extracted text
    return NextResponse.json({ text: extractedText });
  } catch (error) {
    logger.error("Error parsing file:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to parse file" },
      { status: 500 }
    );
  } finally {
    admission.release();
  }
}
