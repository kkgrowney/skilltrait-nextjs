'use client';

import { useState, useEffect } from 'react';

interface CompanyStepProps {
  onNext: () => void;
  onPrevious: () => void;
  selectedTemplate?: string | null;
  templateType?: 'props' | 'achievements';
  logoVisible?: boolean;
  setLogoVisible?: (visible: boolean) => void;
  uploadedLogoFile?: File | null;
  setUploadedLogoFile?: (file: File | null) => void;
  companyNameText?: string;
  setCompanyNameText?: (text: string) => void;
}

export default function CompanyStep({ onNext, onPrevious, selectedTemplate, templateType, logoVisible, setLogoVisible, uploadedLogoFile, setUploadedLogoFile, companyNameText, setCompanyNameText }: CompanyStepProps) {
  const [companyName, setCompanyName] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCompanyNameInput, setShowCompanyNameInput] = useState(false);
  const [modalTrigger, setModalTrigger] = useState<'logo' | 'company' | null>(null);

  // Auto-set Instagram logo for Props templates
  useEffect(() => {
    if (templateType === 'props' && selectedTemplate) {
      // Create a file object from the Instagram logo URL
      fetch('/instagram_placeholder.png')
        .then(response => response.blob())
        .then(blob => {
          const file = new File([blob], 'instagram_logo.png', { type: 'image/png' });
          setUploadedFile(file);
        })
        .catch(error => {
          console.error('Error loading Instagram logo:', error);
        });
    }
  }, [templateType, selectedTemplate]);

  const handleNext = () => {
    if (companyName.trim()) {
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
      if (setLogoVisible) {
        setLogoVisible(true);
      }
      if (setUploadedLogoFile) {
        setUploadedLogoFile(files[0]);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setUploadedFile(files[0]);
      if (setLogoVisible) {
        setLogoVisible(true);
      }
      if (setUploadedLogoFile) {
        setUploadedLogoFile(files[0]);
      }
    }
  };

  const handleDeleteLogo = () => {
    if (modalTrigger === 'logo') {
      setUploadedFile(null);
      if (setLogoVisible) {
        setLogoVisible(false);
      }
      if (setUploadedLogoFile) {
        setUploadedLogoFile(null);
      }
    } else if (modalTrigger === 'company') {
      setShowCompanyNameInput(true);
      if (setLogoVisible) {
        setLogoVisible(false);
      }
      if (setUploadedLogoFile) {
        setUploadedLogoFile(null);
      }
    }
    setShowDeleteModal(false);
    setModalTrigger(null);
  };

  const handleShowDeleteModal = (trigger: 'logo' | 'company') => {
    setModalTrigger(trigger);
    setShowDeleteModal(true);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="text-center mb-8">
        <h1 className="text-[30px] font-bold text-white mb-4">
          Company
        </h1>
        <p className="text-md text-gray-300 mb-0">
          Add company information to personalize your digital award.
        </p>
      </div>
      

      
      <div className="space-y-6 flex-1">
        {/* Drag to upload logo section */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4">Drag to upload logo</h3>
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
            {uploadedFile ? (
              <div className="relative w-[250px] h-[40px] rounded-none flex items-center justify-start">
                <img 
                  src={URL.createObjectURL(uploadedFile)} 
                  alt="Uploaded logo" 
                  className="max-w-[250px] max-h-[40px] w-auto h-auto object-contain mr-6"
                />
                <button
                  onClick={() => handleShowDeleteModal('logo')}
                  className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-none flex items-center justify-center">
                  <img 
                    src="/template_icon.png" 
                    alt="Upload icon" 
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <div className="flex-1">
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
              </div>
            )}
          </div>
          <p className="text-white text-sm mt-2">Max Dimensions: 40 px X 250 px (Dark logo preferred)</p>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 text-gray-400 bg-[#212327]">or</span>
          </div>
        </div>
        
        {/* Enter name section */}
        <div className="p-4 rounded-sm border" style={{backgroundColor: '#1B1D21', borderColor: '#454446'}}>
          <h3 className="text-lg font-medium text-white mb-2">Company Name *</h3>
          {showCompanyNameInput ? (
            <div className="flex items-center space-x-2">
              <input 
                type="text"
                placeholder="Enter company name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                maxLength={18}
                className="flex-1 px-4 py-2 text-sm bg-[#1B1D21] border rounded text-white placeholder-gray-400 focus:outline-none focus:border-[var(--primary-dark)]"
                style={{
                  borderColor: '#454446',
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  color: 'white'
                }}
              />
              <button
                onClick={() => {
                  if (setCompanyNameText) {
                    console.log('Setting company name text:', companyName);
                    setCompanyNameText(companyName);
                  }
                }}
                className="px-4 py-2 text-sm font-medium transition-colors bg-[var(--primary-dark)] text-[#212327] rounded hover:bg-[#0AFB84]"
              >
                Add
              </button>
            </div>
          ) : (
            <div 
              onClick={() => handleShowDeleteModal('company')}
              className="w-full px-4 py-2 text-sm bg-[#1B1D21] border rounded text-white placeholder-gray-400 cursor-pointer hover:border-[var(--primary-dark)] transition-colors"
              style={{borderColor: '#454446'}}
            >
              <span className="text-gray-400">Click to enter company name</span>
            </div>
          )}
          <p className="text-gray-300 text-sm mt-2">The name of the company issuing the award.</p>
        </div>
      </div>
      
      {/* Navigation buttons */}
      <div className="flex justify-between" style={{marginTop: '12px'}}>
        <button 
          onClick={onPrevious}
          className="px-6 py-3 text-sm font-medium transition-colors bg-gray-600 text-white rounded hover:bg-gray-500"
        >
          Previous
        </button>
        <button 
          onClick={handleNext}
          disabled={!companyName.trim()}
          className="px-6 py-3 text-sm font-medium transition-colors bg-[var(--primary-dark)] text-[#212327] rounded hover:bg-[#0AFB84] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999]">
          <div className="bg-[#212327] border border-gray-600 rounded-lg p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-medium text-white mb-4">Remove Logo</h3>
            <p className="text-gray-300 mb-6">Are you sure you want to remove the logo?</p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 text-sm font-medium transition-colors border rounded text-gray-300 hover:text-white"
                style={{borderColor: '#454446'}}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteLogo}
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