'use client';

import { useState } from 'react';
import DigitalAwardsSideNav, { StepType } from '@/components/DigitalAwardsSideNav';
import { AwardsStep, CompanyStep, BackgroundStep, DetailsStep, ShareStep } from '@/components/digital-awards';

export default function DigitalAwardsPage() {
  const [currentStep, setCurrentStep] = useState<StepType>('awards');

  const handleStepChange = (step: StepType) => {
    setCurrentStep(step);
  };

  const handleNext = () => {
    const steps: StepType[] = ['awards', 'company', 'background', 'details', 'share'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    const steps: StepType[] = ['awards', 'company', 'background', 'details', 'share'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'awards':
        return <AwardsStep onNext={handleNext} />;
      case 'company':
        return <CompanyStep onNext={handleNext} onPrevious={handlePrevious} />;
      case 'background':
        return <BackgroundStep onNext={handleNext} onPrevious={handlePrevious} />;
      case 'details':
        return <DetailsStep onNext={handleNext} onPrevious={handlePrevious} />;
      case 'share':
        return <ShareStep onPrevious={handlePrevious} />;
      default:
        return <AwardsStep onNext={handleNext} />;
    }
  };

  return (
    <div className="min-h-screen" style={{backgroundColor: '#1B1D21'}}>
      {/* Main Content with Fixed Nav Offset */}
      <div className="h-screen">
        <div className="flex h-full">
          {/* Side Navigation - Fixed width of 94px */}
          <div className="w-[94px] h-full flex-shrink-0">
            <DigitalAwardsSideNav 
              currentStep={currentStep} 
              onStepChange={handleStepChange} 
            />
          </div>
          
          {/* Left Container - Scrollable, Full Height */}
          <div className="flex-1 h-full overflow-y-auto">
            <div className="h-full" style={{backgroundColor: '#212327', padding: '20px'}}>
              {renderCurrentStep()}
            </div>
          </div>
          
          {/* Right Container - Fixed, Full Height */}
          <div className="w-1/2 h-full">
            <div className="h-full w-full flex flex-col" style={{backgroundColor: '#1B1D21'}}>
              {/* Top Container - 50% height */}
              <div className="h-1/2 w-full">
                {/* Top content will be added here */}
              </div>
              {/* Bottom Container - 50% height with 6:12 responsive layout */}
              <div className="h-1/2 w-full flex gap-4 p-4">
                {/* Left Chart - 6 columns */}
                <div className="w-1/2 h-full">
                  {/* Left chart content will be added here */}
                </div>
                {/* Right Chart - Skill Comparison */}
                <div className="w-1/2 h-full">
                  {/* Right chart content will be added here */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 