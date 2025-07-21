'use client';

import { useState } from 'react';

interface BackgroundStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

export default function BackgroundStep({ onNext, onPrevious }: BackgroundStepProps) {
  const [backgroundType, setBackgroundType] = useState('gradient');
  const [primaryColor, setPrimaryColor] = useState('#00df71');
  const [secondaryColor, setSecondaryColor] = useState('#1B1D21');

  const handleNext = () => {
    onNext();
  };

  return (
    <div className="h-full flex flex-col">
      <div className="text-center mb-8">
        <h1 className="text-[30px] font-bold text-white mb-4">
          Background
        </h1>
        <p className="text-md text-gray-300 mb-6">
          Customize the visual design of your digital award.
        </p>
      </div>
      
      <div className="space-y-4 flex-1">
        <div className="p-4 rounded-sm border" style={{backgroundColor: '#1B1D21', borderColor: '#454446'}}>
          <h3 className="text-lg font-medium text-white mb-2">Background Type</h3>
          <div className="space-y-2">
            <label className="flex items-center">
              <input 
                type="radio"
                name="backgroundType"
                value="gradient"
                checked={backgroundType === 'gradient'}
                onChange={(e) => setBackgroundType(e.target.value)}
                className="mr-2"
              />
              <span className="text-gray-300">Gradient</span>
            </label>
            <label className="flex items-center">
              <input 
                type="radio"
                name="backgroundType"
                value="solid"
                checked={backgroundType === 'solid'}
                onChange={(e) => setBackgroundType(e.target.value)}
                className="mr-2"
              />
              <span className="text-gray-300">Solid Color</span>
            </label>
            <label className="flex items-center">
              <input 
                type="radio"
                name="backgroundType"
                value="image"
                checked={backgroundType === 'image'}
                onChange={(e) => setBackgroundType(e.target.value)}
                className="mr-2"
              />
              <span className="text-gray-300">Image</span>
            </label>
          </div>
        </div>
        
        <div className="p-4 rounded-sm border" style={{backgroundColor: '#1B1D21', borderColor: '#454446'}}>
          <h3 className="text-lg font-medium text-white mb-2">Primary Color</h3>
          <div className="flex items-center space-x-2">
            <input 
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-12 h-8 rounded border"
              style={{borderColor: '#454446'}}
            />
            <input 
              type="text"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="flex-1 px-3 py-2 text-sm bg-[#1B1D21] border rounded text-white"
              style={{borderColor: '#454446'}}
            />
          </div>
          <p className="text-gray-300 text-sm mt-2">Main color for the award design.</p>
        </div>
        
        <div className="p-4 rounded-sm border" style={{backgroundColor: '#1B1D21', borderColor: '#454446'}}>
          <h3 className="text-lg font-medium text-white mb-2">Secondary Color</h3>
          <div className="flex items-center space-x-2">
            <input 
              type="color"
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              className="w-12 h-8 rounded border"
              style={{borderColor: '#454446'}}
            />
            <input 
              type="text"
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              className="flex-1 px-3 py-2 text-sm bg-[#1B1D21] border rounded text-white"
              style={{borderColor: '#454446'}}
            />
          </div>
          <p className="text-gray-300 text-sm mt-2">Secondary color for accents and borders.</p>
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
          className="px-6 py-3 text-sm font-medium transition-colors bg-[var(--primary-dark)] text-[#212327] rounded hover:bg-[#0AFB84]"
        >
          Next
        </button>
      </div>
    </div>
  );
} 