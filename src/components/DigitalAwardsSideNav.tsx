'use client';

import { useState } from 'react';

export type StepType = 'awards' | 'company' | 'background' | 'props-details' | 'share';

interface DigitalAwardsSideNavProps {
  currentStep: StepType;
  onStepChange: (step: StepType) => void;
}

export default function DigitalAwardsSideNav({ currentStep, onStepChange }: DigitalAwardsSideNavProps) {
  const steps: { key: StepType; label: string; icon: string }[] = [
    { key: 'awards', label: 'Awards', icon: '/awards.svg' },
    { key: 'company', label: 'Company', icon: '/company.svg' },
    { key: 'background', label: 'Background', icon: '/background.svg' },
    { key: 'props-details', label: 'Details', icon: '/details.svg' },
    { key: 'share', label: 'Share', icon: '/share.svg' }
  ];

  return (
    <div className="fixed left-0 top-16 bg-[#191d21] flex flex-col gap-2.5 items-center justify-start px-0 py-6 h-full w-[94px]">
      <div className="flex flex-col gap-4">
        {steps.map((step, index) => (
          <div
            key={step.key}
            className="h-[60px] w-[94px] flex flex-col items-center cursor-pointer transition-all duration-200"
            onClick={() => onStepChange(step.key)}
          >
            <div 
              className={`h-[60px] w-[94px] flex flex-col items-center justify-center rounded-none p-2 transition-all duration-200 ${
                currentStep !== step.key ? 'group hover:bg-white/5' : ''
              }`}
            >
              {/* SVG Icon */}
              <div className="w-12 h-12 flex items-center justify-center">
                <div 
                  data-icon
                  className={`w-8 h-8 transition-all duration-200 ${
                    currentStep === step.key 
                      ? 'text-[#00df71]' 
                      : 'text-gray-400'
                  }`}
                  style={{
                    maskImage: `url(${step.icon})`,
                    maskSize: 'contain',
                    maskRepeat: 'no-repeat',
                    maskPosition: 'center',
                    WebkitMaskImage: `url(${step.icon})`,
                    WebkitMaskSize: 'contain',
                    WebkitMaskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'center',
                    backgroundColor: currentStep === step.key 
                      ? '#00df71' 
                      : 'var(--icon-color, #9ca3af)'
                  }}
                />
              </div>
              {/* Label */}
              <div className="mt-1">
                <p 
                  data-text
                  className={`text-xs font-medium text-center transition-colors ${
                    currentStep === step.key 
                      ? 'text-[#00df71]' 
                      : 'text-gray-400'
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