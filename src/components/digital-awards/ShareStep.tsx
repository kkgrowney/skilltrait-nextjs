'use client';

import { useState } from 'react';

interface ShareStepProps {
  onPrevious: () => void;
}

export default function ShareStep({ onPrevious }: ShareStepProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAward, setGeneratedAward] = useState('');

  const handleGenerateAward = async () => {
    setIsGenerating(true);
    
    // Simulate award generation
    setTimeout(() => {
      const award = `
🏆 DIGITAL AWARD CERTIFICATE 🏆

This is to certify that

John Doe

has been awarded the

Employee of the Month

for outstanding achievement in

Excellence in customer service and team collaboration

Date: ${new Date().toLocaleDateString()}
Certificate ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}

This digital award recognizes excellence and dedication in professional development.
      `;
      
      setGeneratedAward(award);
      setIsGenerating(false);
    }, 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedAward], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = 'digital-award.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Digital Award',
        text: generatedAward,
      });
    } else {
      navigator.clipboard.writeText(generatedAward);
      alert('Award copied to clipboard!');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="text-center mb-8">
        <h1 className="text-[30px] font-bold text-white mb-4">
          Share
        </h1>
        <p className="text-md text-gray-300 mb-6">
          Generate and share your digital award.
        </p>
      </div>
      
      <div className="space-y-4 flex-1">
        {!generatedAward ? (
          <div className="p-4 rounded-sm border" style={{backgroundColor: '#1B1D21', borderColor: '#454446'}}>
            <h3 className="text-lg font-medium text-white mb-4">Ready to Generate</h3>
            <p className="text-gray-300 text-sm mb-4">
              Click the button below to generate your digital award based on all the information you've provided.
            </p>
            <button 
              onClick={handleGenerateAward}
              disabled={isGenerating}
              className="w-full px-6 py-3 text-sm font-medium transition-colors bg-[var(--primary-dark)] text-[#212327] rounded hover:bg-[#0AFB84] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Generating...' : 'Generate Award'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-sm border" style={{backgroundColor: '#1B1D21', borderColor: '#454446'}}>
              <h3 className="text-lg font-medium text-white mb-3">Generated Award</h3>
              <div className="bg-[#212327] p-4 rounded border" style={{borderColor: '#454446'}}>
                <pre className="text-gray-300 text-sm whitespace-pre-wrap font-sans">{generatedAward}</pre>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={handleDownload}
                className="flex-1 px-4 py-2 text-sm font-medium transition-colors bg-gray-600 text-white rounded hover:bg-gray-500"
              >
                Download
              </button>
              <button 
                onClick={handleShare}
                className="flex-1 px-4 py-2 text-sm font-medium transition-colors bg-[var(--primary-dark)] text-[#212327] rounded hover:bg-[#0AFB84]"
              >
                Share
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Navigation buttons */}
      <div className="flex justify-between" style={{marginTop: '12px'}}>
        <button 
          onClick={onPrevious}
          className="px-6 py-3 text-sm font-medium transition-colors bg-gray-600 text-white rounded hover:bg-gray-500"
        >
          Previous
        </button>
      </div>
    </div>
  );
} 