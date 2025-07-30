'use client';

import React, { ReactNode } from "react";
import DigitalAwardsSideNav, { StepType } from "@/components/DigitalAwardsSideNav";
import { useNavigation } from "@/contexts/NavigationContext";

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
  const { isCollapsed } = useNavigation();
  const navWidth = isCollapsed ? 64 : 240;
  const navMargin = isCollapsed ? "64px" : "240px";
  
  // Force re-render when navigation state changes
  const [navState, setNavState] = React.useState({ isCollapsed, navWidth, navMargin });
  
  React.useEffect(() => {
    setNavState({ isCollapsed, navWidth, navMargin });
  }, [isCollapsed, navWidth, navMargin]);
  if (isStandalone) {
    // Standalone layout (for digital-awards-generator page)
    return (
      <div className="min-h-screen w-screen" style={{ backgroundColor: "#1B1D21" }}>
        {/* Fixed Side Navigation */}
        <DigitalAwardsSideNav
          currentStep={currentStep}
          onStepChange={onStepChange}
        />

        {/* Main Content with Sticky Nav */}
        <div className="h-screen flex flex-1" style={{ marginLeft: navState.navMargin, overflow: "hidden" }}>
          {/* Left Container - Fixed and Independent */}
          <div 
            className="w-3/12 flex-shrink-0" 
            style={{ 
              backgroundColor: "#212327", 
              padding: "0px", 
              overflow: "hidden",
              maxWidth: "25%"
            }}
          >
            {leftContent}
          </div>

          {/* Right Container - Scrollable */}
          <div className="w-9/12 flex flex-col" style={{ overflow: "hidden" }}>
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
    );
  }

  // Dashboard layout (for DigitalAwardsView)
  return (
    <div className="h-screen w-screen" style={{ backgroundColor: "#1B1D21", overflow: "hidden" }}>
      {/* Main Content Area */}
      <div className="h-full flex flex-col" style={{ marginLeft: navState.navMargin, overflow: "hidden" }}>
        {/* ViewTitle Container */}
        {showViewTitle && (
          <div className="w-full bg-[#1e2327] flex items-center border-b border-[#454446] h-16" style={{ height: "64px !important", minHeight: "64px", maxHeight: "64px", paddingLeft: "12px" }}>
            {/* Title text */}
            <div className="font-semibold text-[#ffffff] text-[18px] whitespace-nowrap">
              {viewTitleText}
            </div>
          </div>
        )}
        
        {/* Parent Container for Left and Right */}
        <div className="flex h-full flex-1" style={{ overflow: "hidden" }}>
          {/* Left Container - Fixed and Independent */}
          <div 
            className="w-3/12 flex-shrink-0" 
            style={{ 
              backgroundColor: "#212327", 
              padding: "0px", 
              overflow: "hidden",
              maxWidth: "25%"
            }}
          >
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
              style={{ backgroundColor: "#212327", padding: "0px", overflow: "hidden" }}
            >
              {leftContent}
            </div>
          </div>

          {/* Right Container - Scrollable */}
          <div className="w-9/12 flex flex-col" style={{ overflow: "hidden" }}>
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