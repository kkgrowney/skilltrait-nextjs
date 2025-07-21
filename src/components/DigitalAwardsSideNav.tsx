'use client';

import { useState } from 'react';

export type StepType = 'awards' | 'company' | 'background' | 'details' | 'share';

interface DigitalAwardsSideNavProps {
  currentStep: StepType;
  onStepChange: (step: StepType) => void;
}

export default function DigitalAwardsSideNav({ currentStep, onStepChange }: DigitalAwardsSideNavProps) {
  const steps: { key: StepType; label: string }[] = [
    { key: 'awards', label: 'Awards' },
    { key: 'company', label: 'Company' },
    { key: 'background', label: 'Background' },
    { key: 'details', label: 'Details' },
    { key: 'share', label: 'Share' }
  ];

  return (
    <div className="bg-[#191d21] flex flex-col gap-2.5 items-center justify-start px-0 py-6 relative h-full w-[94px]">
      <div className="flex flex-col gap-4">
        {steps.map((step, index) => (
          <div
            key={step.key}
            className="h-[60px] w-[94px] flex flex-col items-center cursor-pointer"
            onClick={() => onStepChange(step.key)}
          >
            <div className="flex flex-col items-center">
              {/* Icon placeholder - 40px square */}
              <div 
                className={`w-10 h-10 rounded transition-colors ${
                  currentStep === step.key 
                    ? 'bg-[#00df71]' 
                    : 'bg-[#d9d9d9] hover:bg-gray-300'
                }`}
              />
              {/* Label */}
              <div className="mt-2">
                <p 
                  className={`text-xs font-medium text-center transition-colors ${
                    currentStep === step.key 
                      ? 'text-[#00df71]' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  {step.label}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 