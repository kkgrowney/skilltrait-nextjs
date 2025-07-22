'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface PdfUploadProps {
  onTextExtracted: (text: string) => void;
  onError: (error: string) => void;
  onFileUploaded: (file: File | null) => void;
}

export default function PdfUpload({ onTextExtracted, onError, onFileUploaded }: PdfUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [extractionSuccess, setExtractionSuccess] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    setUploadedFileName(file.name);

    try {
      // Upload and extract text from the PDF
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (data.extractedText && data.extractedText.trim().length > 0) {
          // Automatic extraction succeeded
          onTextExtracted(data.extractedText);
          setExtractionSuccess(true);
        } else {
          // Automatic extraction failed, but PDF is still available for ChatGPT
          setExtractionSuccess(false);
        }
        // Always pass the file to parent component for direct processing
        onFileUploaded(file);
        onError(''); // Clear any previous errors
      } else {
        onError(data.error || 'Failed to process PDF');
        setUploadedFileName(null);
      }
    } catch (error) {
      console.error('Error uploading PDF:', error);
      onError('Failed to upload PDF file. Please try again.');
      setUploadedFileName(null);
    } finally {
      setIsUploading(false);
    }
  }, [onTextExtracted, onError, onFileUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  const handleRemoveFile = () => {
    setUploadedFileName(null);
    setExtractionSuccess(false);
    onTextExtracted('');
    onFileUploaded(null);
  };

  return (
    <div className="space-y-3">
      {!uploadedFileName ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive 
              ? 'border-[var(--primary-dark)] bg-[#1B1D21]' 
              : 'border-[#454446] hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <div className="space-y-2">
            <svg 
              className="mx-auto h-8 w-8 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
              />
            </svg>
            <div className="text-sm text-gray-300">
              {isDragActive ? (
                <p>Drop the PDF here...</p>
              ) : (
                <div>
                  <p className="font-medium">Upload PDF Resume</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Drag and drop a PDF file, or click to select
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-[#1B1D21] border border-[#454446] rounded-lg">
          <div className="flex items-center space-x-3">
            <svg 
              className="h-5 w-5 text-green-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <span className="text-sm text-white">{uploadedFileName}</span>
            {isUploading && (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--primary-dark)]"></div>
                  <span className="text-xs text-gray-400">
                    {extractionSuccess ? 'Processing...' : 'Extracting text...'}
                  </span>
              </div>
            )}
          </div>
          <button
            onClick={handleRemoveFile}
            className="text-gray-400 hover:text-white transition-colors"
            title="Remove file"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          </div>
          
          {extractionSuccess && (
            <div className="p-3 bg-green-900/20 border border-green-500/30 rounded text-green-300 text-sm">
              <div className="flex items-start space-x-2">
                <svg className="h-5 w-5 text-green-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-medium mb-1">Text Extracted Successfully!</p>
                  <p className="text-xs text-green-200">
                    The text from your PDF has been automatically extracted and is ready for analysis.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 