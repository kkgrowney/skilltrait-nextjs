'use client';

import { useState, useEffect } from 'react';

interface BackgroundStepProps {
  onNext: () => void;
  onPrevious: () => void;
  selectedTemplate?: string | null;
  templateType?: 'props' | 'achievements';
  backgroundVisible?: boolean;
  setBackgroundVisible?: (visible: boolean) => void;
  uploadedBackgroundFile?: File | null;
  setUploadedBackgroundFile?: (file: File | null) => void;
  backgroundNameText?: string;
  setBackgroundNameText?: (text: string) => void;
  defaultBackgroundUrl?: string | null;
}

export default function BackgroundStep({ onNext, onPrevious, selectedTemplate, templateType, backgroundVisible, setBackgroundVisible, uploadedBackgroundFile, setUploadedBackgroundFile, backgroundNameText, setBackgroundNameText, defaultBackgroundUrl }: BackgroundStepProps) {
  const [backgroundName, setBackgroundName] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBackgroundNameInput, setShowBackgroundNameInput] = useState(false);
  const [modalTrigger, setModalTrigger] = useState<'background' | 'name' | null>(null);
  const [hasConfirmedModal, setHasConfirmedModal] = useState(false);
  const [backgroundDeleted, setBackgroundDeleted] = useState(false);

  useEffect(() => {
    if (!uploadedFile && uploadedBackgroundFile) {
      setUploadedFile(uploadedBackgroundFile);
    }
  }, [uploadedBackgroundFile]);

  const handleNext = () => {
    if (backgroundName.trim()) {
      onNext();
    }
  };

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
      setUploadedFile(files[0]);
      setBackgroundDeleted(false);
      if (setBackgroundVisible) {
        setBackgroundVisible(true);
      }
      if (setUploadedBackgroundFile) {
        setUploadedBackgroundFile(files[0]);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setUploadedFile(files[0]);
      setBackgroundDeleted(false);
      if (setBackgroundVisible) {
        setBackgroundVisible(true);
      }
      if (setUploadedBackgroundFile) {
        setUploadedBackgroundFile(files[0]);
      }
    }
  };

  const handleDeleteBackground = () => {
    if (modalTrigger === 'background') {
      setUploadedFile(null);
      setBackgroundDeleted(true);
      if (setBackgroundVisible) {
        setBackgroundVisible(false);
      }
      if (setUploadedBackgroundFile) {
        setUploadedBackgroundFile(null);
      }
    } else if (modalTrigger === 'name') {
      setShowBackgroundNameInput(true);
      setHasConfirmedModal(true);
      if (setBackgroundVisible) {
        setBackgroundVisible(false);
      }
      if (setUploadedBackgroundFile) {
        setUploadedBackgroundFile(null);
      }
    }
    setShowDeleteModal(false);
    setModalTrigger(null);
  };

  const handleShowDeleteModal = (trigger: 'background' | 'name') => {
    setModalTrigger(trigger);
    setShowDeleteModal(true);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="text-center mb-8">
        <h1 className="text-[30px] font-bold text-white mb-4">
          Background
        </h1>
        <p className="text-md text-gray-300 mb-0">
          Add background information to personalize your digital award.
        </p>
      </div>
      

      
      <div className="space-y-6">
        {/* Drag to upload background section */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4">Drag to upload background</h3>
          <div
            className={`w-full bg-white rounded-lg p-6 transition-colors ${
              isDragOver 
                ? 'border-2 border-[var(--primary-dark)]' 
                : 'border-2 border-transparent'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {!backgroundDeleted && (uploadedFile ? (
              <div className="relative w-[300px] h-[200px] rounded-none flex items-center justify-center overflow-hidden">
                <img 
                  src={URL.createObjectURL(uploadedFile)} 
                  alt="Uploaded background" 
                  className="w-[300px] h-[200px] object-cover rounded"
                  style={{
                    minWidth: '300px',
                    minHeight: '200px',
                    objectFit: 'cover',
                    objectPosition: 'center'
                  }}
                />
                <button
                  onClick={() => handleShowDeleteModal('background')}
                  className="absolute w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                  style={{ top: '12px', right: '12px' }}
                >
                  ×
                </button>
              </div>
            ) : uploadedBackgroundFile ? (
              <div className="relative w-[300px] h-[200px] rounded-none flex items-center justify-center overflow-hidden">
                <img 
                  src={URL.createObjectURL(uploadedBackgroundFile)} 
                  alt="Uploaded background" 
                  className="w-[300px] h-[200px] object-cover rounded"
                  style={{
                    minWidth: '300px',
                    minHeight: '200px',
                    objectFit: 'cover',
                    objectPosition: 'center'
                  }}
                />
                <button
                  onClick={() => handleShowDeleteModal('background')}
                  className="absolute w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                  style={{ top: '12px', right: '12px' }}
                >
                  ×
                </button>
              </div>
            ) : defaultBackgroundUrl ? (
              <div className="relative w-[300px] h-[200px] rounded-none flex items-center justify-center overflow-hidden">
                <img 
                  src={defaultBackgroundUrl} 
                  alt="Default background" 
                  className="w-[300px] h-[200px] object-cover rounded"
                  style={{
                    minWidth: '300px',
                    minHeight: '200px',
                    objectFit: 'cover',
                    objectPosition: 'center'
                  }}
                />
                <button
                  onClick={() => handleShowDeleteModal('background')}
                  className="absolute w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                  style={{ top: '12px', right: '12px' }}
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <span className="text-gray-800 text-sm">
                    Click to upload or drag and drop
                  </span>
                </label>
              </div>
            ))}
          </div>
          <p className="text-white text-sm mt-2">Background dimensions: 400 px (H) X 600 px (W)</p>
        </div>

      </div>
      
      {/* Next button - right justified below container */}
      <div className="flex justify-end" style={{marginTop: '24px'}}>
        <button 
          onClick={onNext}
          className="px-6 py-3 text-sm font-medium transition-colors bg-[var(--primary-dark)] text-[#212327] rounded hover:bg-[#0AFB84]"
        >
          Next
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999]">
          <div className="bg-[#212327] border border-gray-600 rounded-lg p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-medium text-white mb-4">Remove Background</h3>
            <p className="text-gray-300 mb-6">Are you sure you want to remove the background?</p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 text-sm font-medium transition-colors border rounded text-gray-300 hover:text-white"
                style={{borderColor: '#454446'}}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBackground}
                className="flex-1 px-4 py-2 text-sm font-medium transition-colors bg-red-500 text-white rounded hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
} 