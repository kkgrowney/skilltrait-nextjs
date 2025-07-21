'use client';

import { useState } from 'react';

interface AwardsStepProps {
  onNext: () => void;
}

export default function AwardsStep({ onNext }: AwardsStepProps) {
  const [awardType, setAwardType] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [achievement, setAchievement] = useState('');

  const handleNext = () => {
    if (awardType.trim() && recipientName.trim() && achievement.trim()) {
      onNext();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="text-center mb-8">
        <h1 className="text-[30px] font-bold text-white mb-4">
          Awards
        </h1>
        <p className="text-md text-gray-300 mb-6">
          Create professional digital awards and certificates to recognize achievements and milestones.
        </p>
      </div>
      
      <div className="space-y-4 flex-1">
        <div className="p-4 rounded-sm border" style={{backgroundColor: '#1B1D21', borderColor: '#454446'}}>
          <h3 className="text-lg font-medium text-white mb-2">Award Type *</h3>
          <input 
            type="text"
            placeholder="e.g., Employee of the Month, Project Excellence, Innovation Award"
            value={awardType}
            onChange={(e) => setAwardType(e.target.value)}
            className="w-full px-4 py-2 text-sm bg-[#1B1D21] border rounded text-white placeholder-gray-400 focus:outline-none focus:border-[var(--primary-dark)]"
            style={{borderColor: '#454446'}}
          />
          <p className="text-gray-300 text-sm mt-2">Enter the type of award or certificate you want to create.</p>
        </div>
        
        <div className="p-4 rounded-sm border" style={{backgroundColor: '#1B1D21', borderColor: '#454446'}}>
          <h3 className="text-lg font-medium text-white mb-2">Recipient Name *</h3>
          <input 
            type="text"
            placeholder="Enter the recipient's full name"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            className="w-full px-4 py-2 text-sm bg-[#1B1D21] border rounded text-white placeholder-gray-400 focus:outline-none focus:border-[var(--primary-dark)]"
            style={{borderColor: '#454446'}}
          />
          <p className="text-gray-300 text-sm mt-2">The name of the person receiving the award.</p>
        </div>
        
        <div className="p-4 rounded-sm border" style={{backgroundColor: '#1B1D21', borderColor: '#454446'}}>
          <h3 className="text-lg font-medium text-white mb-2">Achievement Description *</h3>
          <textarea 
            placeholder="Describe the achievement, milestone, or contribution being recognized..."
            value={achievement}
            onChange={(e) => setAchievement(e.target.value)}
            className="w-full px-4 py-2 text-sm bg-[#1B1D21] border rounded text-white placeholder-gray-400 focus:outline-none focus:border-[var(--primary-dark)] resize-none"
            rows={4}
            style={{borderColor: '#454446'}}
          />
          <p className="text-gray-300 text-sm mt-2">Provide details about what the award is recognizing.</p>
        </div>
      </div>
      
      {/* Next button */}
      <div className="flex justify-end" style={{marginTop: '12px'}}>
        <button 
          onClick={handleNext}
          disabled={!awardType.trim() || !recipientName.trim() || !achievement.trim()}
          className="px-6 py-3 text-sm font-medium transition-colors bg-[var(--primary-dark)] text-[#212327] rounded hover:bg-[#0AFB84] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
} 