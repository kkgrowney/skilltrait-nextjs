'use client';

import { useState } from 'react';

interface DragDropUploadProps {
  onFileUpload: (file: File) => void;
  onFileRemove: () => void;
  uploadedFile: File | null;
  title: string;
  description: string;
  maxDimensions: string;
  acceptTypes?: string;
  previewWidth?: string;
  previewHeight?: string;
  className?: string;
}

export default function DragDropUpload({
  onFileUpload,
  onFileRemove,
  uploadedFile,
  title,
  description,
  maxDimensions,
  acceptTypes = "image/*",
  previewWidth = "w-20",
  previewHeight = "h-20",
  className = ""
}: DragDropUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileUpload(files[0]);
    }
  };

  return (
    <div className={`bg-[#1A1D21] rounded-lg shadow-sm border border-[#454446] p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <label className="px-3 py-1 text-xs bg-[#00DF71] text-[#212327] rounded-full hover:bg-[#0AFB84] transition-colors cursor-pointer">
          Upload
          <input
            type="file"
            accept={acceptTypes}
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      </div>
      
      <div
        className={`w-full bg-[#121417] rounded-lg p-6 transition-colors ${
          isDragOver 
            ? 'border-2 border-[#00DF71] bg-[#1B1D21]' 
            : 'border-2 border-transparent'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {uploadedFile ? (
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-gray-300 text-sm mb-2">{description}</p>
              <p className="text-gray-400 text-xs mb-2">Max Dimensions: {maxDimensions}</p>
              <button
                onClick={onFileRemove}
                className="text-red-400 text-xs hover:text-red-300 transition-colors"
              >
                Remove file
              </button>
            </div>
            
            <div className={`${title === "Logo" ? "w-[294px] h-20" : previewWidth + " " + previewHeight} bg-white rounded-none flex items-center justify-start overflow-hidden ml-5 mr-5 my-5 pl-5`}>
              <img
                src={URL.createObjectURL(uploadedFile)}
                alt="Uploaded file"
                className={`${title === "Background Image" ? "w-full h-full object-cover" : "h-10 w-[250px] object-contain"}`}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept={acceptTypes}
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <span className="text-gray-300 text-sm">
                  Click to upload or drag and drop
                </span>
              </label>
              <p className="text-gray-400 text-xs mt-1">Max Dimensions: {maxDimensions}</p>
            </div>
            
            <div className={`${previewWidth} ${previewHeight} bg-white border-2 border-dashed border-[#454446] rounded-[8px] flex items-center justify-center`}>
              <div className="text-gray-400 text-xs">{maxDimensions}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 