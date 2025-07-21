'use client';

import { useState } from 'react';
import DigitalAwardsSideNav, { StepType } from '@/components/DigitalAwardsSideNav';
import { AwardsStep, CompanyStep, BackgroundStep, DetailsStep, ShareStep } from '@/components/digital-awards';

export default function DigitalAwardsPage() {
  const [currentStep, setCurrentStep] = useState<StepType>('awards');
  const [activeTab, setActiveTab] = useState<'props' | 'achievements'>('props');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showTemplateDetail, setShowTemplateDetail] = useState(false);

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

  const handleTemplateSelect = (templateSrc: string) => {
    setSelectedTemplate(templateSrc);
    setShowTemplateDetail(true);
    // Don't change the current step - stay on Awards
  };

  const handleBackToTemplates = () => {
    setShowTemplateDetail(false);
    setSelectedTemplate(null);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'awards':
        return <AwardsStep onNext={handleNext} onTabChange={setActiveTab} />;
      case 'company':
        return <CompanyStep onNext={handleNext} onPrevious={handlePrevious} selectedTemplate={selectedTemplate} />;
      case 'background':
        return <BackgroundStep onNext={handleNext} onPrevious={handlePrevious} />;
      case 'details':
        return <DetailsStep onNext={handleNext} onPrevious={handlePrevious} />;
      case 'share':
        return <ShareStep onPrevious={handlePrevious} />;
      default:
        return <AwardsStep onNext={handleNext} onTabChange={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen" style={{backgroundColor: '#1B1D21'}}>
      {/* Fixed Side Navigation */}
      <DigitalAwardsSideNav 
        currentStep={currentStep} 
        onStepChange={handleStepChange} 
      />
      
      {/* Main Content with Sticky Nav */}
      <div className="h-screen">
        <div className="flex h-full">
          {/* Side Navigation - Fixed width of 94px */}
          <div className="w-[94px] h-full flex-shrink-0">
            {/* Fixed side nav is now positioned absolutely */}
          </div>
          
          {/* Left Container - Fixed Height (3 parts) */}
          <div className="w-3/12 h-full overflow-y-auto">
            <div className="h-full" style={{backgroundColor: '#212327', padding: '20px'}}>
              {showTemplateDetail ? <AwardsStep onNext={handleNext} onTabChange={setActiveTab} /> : renderCurrentStep()}
            </div>
          </div>
          
          {/* Right Container - Fixed, Full Height (9 parts) */}
          <div className="w-9/12 h-full flex flex-col">
            {/* Fixed Header */}
            <div className="flex-shrink-0 px-6 pt-5" style={{backgroundColor: '#1B1D21'}}>
              <h1 className="text-[30px] font-bold text-white mb-4">
                {showTemplateDetail ? 'Template Detail' : (activeTab === 'props' ? 'Props Templates' : 'Achievement Templates')}
              </h1>
              {!showTemplateDetail && (
                <p className="text-md text-gray-300 mb-6">
                  Choose a template for your achievement. You can update this later in saved awards.
                </p>
              )}
            </div>
            
            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-6" style={{backgroundColor: '#1B1D21'}}>
              {showTemplateDetail ? (
                /* Template Detail View */
                <div className="h-full flex flex-col items-center justify-start pt-6">
                  {/* Back Button */}
                  <div className="w-full mb-6">
                    <button
                      onClick={handleBackToTemplates}
                      className="flex items-center text-gray-300 hover:text-white transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Back to Templates
                    </button>
                  </div>
                  
                  {/* Selected Template Display */}
                  {selectedTemplate && (
                    <div className="w-full flex justify-center">
                      <img 
                        src={selectedTemplate}
                        alt="Selected Template"
                        className="max-w-full max-h-auto object-contain rounded"
                        style={{borderRadius: '4px'}}
                      />
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="w-full flex gap-4 justify-center" style={{marginTop: '24px'}}>
                    <button
                      onClick={handleBackToTemplates}
                      className="px-6 py-3 text-sm font-medium transition-colors border rounded text-gray-300 hover:text-white whitespace-nowrap"
                      style={{borderColor: '#454446', width: '150px'}}
                    >
                      Back
                    </button>
                    <button
                      onClick={() => {
                        // Handle template selection - move to Company step
                        setCurrentStep('company');
                        setShowTemplateDetail(false);
                      }}
                      className="px-6 py-3 text-sm font-medium transition-colors bg-[var(--primary-dark)] text-[#212327] rounded hover:bg-[#0AFB84] whitespace-nowrap"
                      style={{width: '150px'}}
                    >
                      Select Template
                    </button>
                  </div>
                </div>
              ) : (
                /* Template Grid View */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 justify-start pb-6 h-full">
                {/* Template A */}
                <div className="w-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                  <img 
                    src="https://picsum.photos/600/400?random=1" 
                    alt="Template A"
                    className="w-full h-auto max-h-full object-contain"
                    style={{width: '600px', maxWidth: '100%', borderRadius: '4px'}}
                    onClick={() => handleTemplateSelect("https://picsum.photos/600/400?random=1")}
                  />
                </div>
                
                {/* Template B */}
                <div className="w-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                  <img 
                    src="https://picsum.photos/600/400?random=2" 
                    alt="Template B"
                    className="w-full h-auto max-h-full object-contain"
                    style={{width: '600px', maxWidth: '100%', borderRadius: '4px'}}
                    onClick={() => handleTemplateSelect("https://picsum.photos/600/400?random=2")}
                  />
                </div>
                
                {/* Template C */}
                <div className="w-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                  <img 
                    src="https://picsum.photos/600/400?random=3" 
                    alt="Template C"
                    className="w-full h-auto max-h-full object-contain"
                    style={{width: '600px', maxWidth: '100%', borderRadius: '4px'}}
                    onClick={() => handleTemplateSelect("https://picsum.photos/600/400?random=3")}
                  />
                </div>
                
                {/* Template D */}
                <div className="w-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                  <img 
                    src="https://picsum.photos/600/400?random=4" 
                    alt="Template D"
                    className="w-full h-auto max-h-full object-contain"
                    style={{width: '600px', maxWidth: '100%', borderRadius: '4px'}}
                    onClick={() => handleTemplateSelect("https://picsum.photos/600/400?random=4")}
                  />
                </div>
                
                {/* Template E */}
                <div className="w-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                  <img 
                    src="https://picsum.photos/600/400?random=5" 
                    alt="Template E"
                    className="w-full h-auto max-h-full object-contain"
                    style={{width: '600px', maxWidth: '100%', borderRadius: '4px'}}
                    onClick={() => handleTemplateSelect("https://picsum.photos/600/400?random=5")}
                  />
                </div>
                
                {/* Template F */}
                <div className="w-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                  <img 
                    src="https://picsum.photos/600/400?random=6" 
                    alt="Template F"
                    className="w-full h-auto max-h-full object-contain"
                    style={{width: '600px', maxWidth: '100%', borderRadius: '4px'}}
                    onClick={() => handleTemplateSelect("https://picsum.photos/600/400?random=6")}
                  />
                </div>
                
                {/* Template G */}
                <div className="w-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                  <img 
                    src="https://picsum.photos/600/400?random=7" 
                    alt="Template G"
                    className="w-full h-auto max-h-full object-contain"
                    style={{width: '600px', maxWidth: '100%', borderRadius: '4px'}}
                    onClick={() => handleTemplateSelect("https://picsum.photos/600/400?random=7")}
                  />
                </div>
                
                {/* Template H */}
                <div className="w-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                  <img 
                    src="https://picsum.photos/600/400?random=8" 
                    alt="Template H"
                    className="w-full h-auto max-h-full object-contain"
                    style={{width: '600px', maxWidth: '100%', borderRadius: '4px'}}
                    onClick={() => handleTemplateSelect("https://picsum.photos/600/400?random=8")}
                  />
                </div>
                
                {/* Template I */}
                <div className="w-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                  <img 
                    src="https://picsum.photos/600/400?random=9" 
                    alt="Template I"
                    className="w-full h-auto max-h-full object-contain"
                    style={{width: '600px', maxWidth: '100%', borderRadius: '4px'}}
                    onClick={() => handleTemplateSelect("https://picsum.photos/600/400?random=9")}
                  />
                </div>
                
                {/* Template J */}
                <div className="w-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                  <img 
                    src="https://picsum.photos/600/400?random=10" 
                    alt="Template J"
                    className="w-full h-auto max-h-full object-contain"
                    style={{width: '600px', maxWidth: '100%', borderRadius: '4px'}}
                    onClick={() => handleTemplateSelect("https://picsum.photos/600/400?random=10")}
                  />
                </div>
                
                {/* Template K */}
                <div className="w-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                  <img 
                    src="https://picsum.photos/600/400?random=11" 
                    alt="Template K"
                    className="w-full h-auto max-h-full object-contain"
                    style={{width: '600px', maxWidth: '100%', borderRadius: '4px'}}
                    onClick={() => handleTemplateSelect("https://picsum.photos/600/400?random=11")}
                  />
                </div>
                
                {/* Template L */}
                <div className="w-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                  <img 
                    src="https://picsum.photos/600/400?random=12" 
                    alt="Template L"
                    className="w-full h-auto max-h-full object-contain"
                    style={{width: '600px', maxWidth: '100%', borderRadius: '4px'}}
                    onClick={() => handleTemplateSelect("https://picsum.photos/600/400?random=12")}
                  />
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 