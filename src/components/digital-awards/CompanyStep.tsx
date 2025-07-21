'use client';

import { useState } from 'react';

interface CompanyStepProps {
  onNext: () => void;
  onPrevious: () => void;
  selectedTemplate?: string | null;
}

export default function CompanyStep({ onNext, onPrevious, selectedTemplate }: CompanyStepProps) {
  const [companyName, setCompanyName] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');

  const handleNext = () => {
    if (companyName.trim()) {
      onNext();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="text-center mb-8">
        <h1 className="text-[30px] font-bold text-white mb-4">
          Company
        </h1>
        <p className="text-md text-gray-300 mb-6">
          Add company information to personalize your digital award.
        </p>
      </div>
      

      
      <div className="space-y-4 flex-1">
        <div className="p-4 rounded-sm border" style={{backgroundColor: '#1B1D21', borderColor: '#454446'}}>
          <h3 className="text-lg font-medium text-white mb-2">Company Name *</h3>
          <input 
            type="text"
            placeholder="Enter company name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full px-4 py-2 text-sm bg-[#1B1D21] border rounded text-white placeholder-gray-400 focus:outline-none focus:border-[var(--primary-dark)]"
            style={{borderColor: '#454446'}}
          />
          <p className="text-gray-300 text-sm mt-2">The name of the company issuing the award.</p>
        </div>
        
        <div className="p-4 rounded-sm border" style={{backgroundColor: '#1B1D21', borderColor: '#454446'}}>
          <h3 className="text-lg font-medium text-white mb-2">Company Logo URL</h3>
          <input 
            type="url"
            placeholder="https://example.com/logo.png"
            value={companyLogo}
            onChange={(e) => setCompanyLogo(e.target.value)}
            className="w-full px-4 py-2 text-sm bg-[#1B1D21] border rounded text-white placeholder-gray-400 focus:outline-none focus:border-[var(--primary-dark)]"
            style={{borderColor: '#454446'}}
          />
          <p className="text-gray-300 text-sm mt-2">Optional: URL to the company logo image.</p>
        </div>
        
        <div className="p-4 rounded-sm border" style={{backgroundColor: '#1B1D21', borderColor: '#454446'}}>
          <h3 className="text-lg font-medium text-white mb-2">Company Website</h3>
          <input 
            type="url"
            placeholder="https://company.com"
            value={companyWebsite}
            onChange={(e) => setCompanyWebsite(e.target.value)}
            className="w-full px-4 py-2 text-sm bg-[#1B1D21] border rounded text-white placeholder-gray-400 focus:outline-none focus:border-[var(--primary-dark)]"
            style={{borderColor: '#454446'}}
          />
          <p className="text-gray-300 text-sm mt-2">Optional: Company website URL.</p>
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
    </div>
  );
} 