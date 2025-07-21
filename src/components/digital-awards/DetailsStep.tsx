'use client';

import { useState } from 'react';

interface DetailsStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

export default function DetailsStep({ onNext, onPrevious }: DetailsStepProps) {
  const [awardDate, setAwardDate] = useState('');
  const [presenterName, setPresenterName] = useState('');
  const [certificateNumber, setCertificateNumber] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const handleNext = () => {
    if (awardDate.trim()) {
      onNext();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="text-center mb-8">
        <h1 className="text-[30px] font-bold text-white mb-4">
          Details
        </h1>
        <p className="text-md text-gray-300 mb-6">
          Add final details to complete your digital award.
        </p>
      </div>
      
      <div className="space-y-4 flex-1">
        <div className="p-4 rounded-sm border" style={{backgroundColor: '#1B1D21', borderColor: '#454446'}}>
          <h3 className="text-lg font-medium text-white mb-2">Award Date *</h3>
          <input 
            type="date"
            value={awardDate}
            onChange={(e) => setAwardDate(e.target.value)}
            className="w-full px-4 py-2 text-sm bg-[#1B1D21] border rounded text-white focus:outline-none focus:border-[var(--primary-dark)]"
            style={{borderColor: '#454446'}}
          />
          <p className="text-gray-300 text-sm mt-2">The date when the award is presented.</p>
        </div>
        
        <div className="p-4 rounded-sm border" style={{backgroundColor: '#1B1D21', borderColor: '#454446'}}>
          <h3 className="text-lg font-medium text-white mb-2">Presenter Name</h3>
          <input 
            type="text"
            placeholder="Enter presenter's name"
            value={presenterName}
            onChange={(e) => setPresenterName(e.target.value)}
            className="w-full px-4 py-2 text-sm bg-[#1B1D21] border rounded text-white placeholder-gray-400 focus:outline-none focus:border-[var(--primary-dark)]"
            style={{borderColor: '#454446'}}
          />
          <p className="text-gray-300 text-sm mt-2">Optional: Name of the person presenting the award.</p>
        </div>
        
        <div className="p-4 rounded-sm border" style={{backgroundColor: '#1B1D21', borderColor: '#454446'}}>
          <h3 className="text-lg font-medium text-white mb-2">Certificate Number</h3>
          <input 
            type="text"
            placeholder="e.g., CERT-2024-001"
            value={certificateNumber}
            onChange={(e) => setCertificateNumber(e.target.value)}
            className="w-full px-4 py-2 text-sm bg-[#1B1D21] border rounded text-white placeholder-gray-400 focus:outline-none focus:border-[var(--primary-dark)]"
            style={{borderColor: '#454446'}}
          />
          <p className="text-gray-300 text-sm mt-2">Optional: Unique identifier for the certificate.</p>
        </div>
        
        <div className="p-4 rounded-sm border" style={{backgroundColor: '#1B1D21', borderColor: '#454446'}}>
          <h3 className="text-lg font-medium text-white mb-2">Additional Notes</h3>
          <textarea 
            placeholder="Any additional information or special notes..."
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            className="w-full px-4 py-2 text-sm bg-[#1B1D21] border rounded text-white placeholder-gray-400 focus:outline-none focus:border-[var(--primary-dark)] resize-none"
            rows={3}
            style={{borderColor: '#454446'}}
          />
          <p className="text-gray-300 text-sm mt-2">Optional: Additional details or special instructions.</p>
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
          disabled={!awardDate.trim()}
          className="px-6 py-3 text-sm font-medium transition-colors bg-[var(--primary-dark)] text-[#212327] rounded hover:bg-[#0AFB84] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
} 