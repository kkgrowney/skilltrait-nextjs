'use client';

import { ReactNode } from "react";
import DigitalAwardsSideNav, { StepType } from "@/components/DigitalAwardsSideNav";

interface DigitalAwardsLayoutProps {
  currentStep: StepType;
  onStepChange: (step: StepType) => void;
  leftContent: ReactNode;
  rightContent: ReactNode;
  showViewTitle?: boolean;
  viewTitleText?: string;
  isStandalone?: boolean;
}

export default function DigitalAwardsLayout({
  currentStep,
  onStepChange,
  leftContent,
  rightContent,
  showViewTitle = false,
  viewTitleText = "Awards Generator",
  isStandalone = false
}: DigitalAwardsLayoutProps) {
  if (isStandalone) {
    // Standalone layout (for digital-awards-generator page)
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#1B1D21" }}>
        {/* Fixed Side Navigation */}
        <DigitalAwardsSideNav
          currentStep={currentStep}
          onStepChange={onStepChange}
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
              <div
                className="h-full"
                style={{ backgroundColor: "#212327", padding: "20px" }}
              >
                {leftContent}
              </div>
            </div>

            {/* Right Container - Fixed, Full Height (9 parts) */}
            <div className="w-9/12 h-full flex flex-col">
              {/* Fixed Header */}
              <div
                className="flex-shrink-0 px-6 pt-5"
                style={{ backgroundColor: "#1B1D21" }}
              >
                <h1 className="text-[30px] font-bold text-white mb-4">
                  {viewTitleText}
                </h1>
              </div>

              {/* Content Area */}
              <div
                className="flex-1 overflow-y-auto px-6"
                style={{ backgroundColor: "#1B1D21" }}
              >
                {rightContent}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard layout (for DigitalAwardsView)
  return (
    <div className="h-screen" style={{ backgroundColor: "#1B1D21" }}>
      {/* Main Content Area */}
      <div className="h-full flex flex-col" style={{ marginLeft: "64px", width: "calc(100% - 64px)" }}>
        {/* ViewTitle Container */}
        {showViewTitle && (
          <div className="w-full bg-[#1e2327] flex items-center border-b border-[#454446] h-16" style={{ marginLeft: "-64px", width: "calc(100vw - 64px)", height: "64px !important", minHeight: "64px", maxHeight: "64px", paddingLeft: "12px" }}>
            {/* Title text */}
            <div className="font-semibold text-[#ffffff] text-[18px] whitespace-nowrap">
              {viewTitleText}
            </div>
          </div>
        )}
        
        {/* Parent Container for Left and Right */}
        <div className="w-full flex" style={{ marginLeft: "-64px", width: "calc(100vw - 64px)" }}>
          {/* Left Container - Fixed Height (3 parts) */}
          <div className="w-3/12 h-full overflow-y-auto flex">
            {/* Awards Generator Side Navigation - Now inside left container */}
            <div className="w-[94px] h-full" style={{ marginTop: "20px" }}>
              <DigitalAwardsSideNav
                currentStep={currentStep}
                onStepChange={onStepChange}
              />
            </div>
            
            {/* Content area */}
            <div
              className="flex-1"
              style={{ backgroundColor: "#212327", padding: "20px" }}
            >
              {leftContent}
            </div>
          </div>

          {/* Right Container - Fixed, Full Height (9 parts) */}
          <div className="w-9/12 h-full flex flex-col">
            {/* Content Area */}
            <div
              className="flex-1 overflow-y-auto px-6"
              style={{ backgroundColor: "#1B1D21" }}
            >
              {rightContent}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 