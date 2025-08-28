"use client";

import React, { ReactNode } from "react";
import DigitalAwardsSideNav, {
  StepType,
} from "@/components/DigitalAwardsSideNav";
import { useNavigation } from "@/contexts/NavigationContext";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

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
  isStandalone = false,
}: DigitalAwardsLayoutProps) {
  const { isCollapsed } = useNavigation();
  const { logout, isLoggingOut, user } = useAuth();
  const router = useRouter();
  const navWidth = isCollapsed ? 64 : 240;
  const navMargin = isCollapsed ? "64px" : "240px";

  // Determine the height based on authentication status
  const containerHeight = user ? "100vh" : "calc(100vh - var(--nav-height))";

  const handleLogout = async () => {
    console.log("Digital awards layout logout button clicked");

    const confirmed = window.confirm("Are you sure you want to sign out?");
    console.log("User confirmed:", confirmed);

    if (!confirmed) return;

    console.log("Calling logout function...");
    const success = await logout();
    console.log("Logout result:", success);

    if (success) {
      console.log("Successfully signed out");
      router.push("/signin");
    } else {
      console.error("Failed to sign out");
      alert("Failed to sign out. Please try again.");
    }
  };

  // Force re-render when navigation state changes
  const [navState, setNavState] = React.useState({
    isCollapsed,
    navWidth,
    navMargin,
  });

  React.useEffect(() => {
    setNavState({ isCollapsed, navWidth, navMargin });
  }, [isCollapsed, navWidth, navMargin]);
  if (isStandalone) {
    // Standalone layout (for digital-awards-generator page)
    return (
      <div
        className="w-full flex"
        style={{
          backgroundColor: "#1B1D21",
          overflow: "hidden",
          height: containerHeight,
        }}
      >
        {/* Fixed Side Navigation */}
        <DigitalAwardsSideNav
          currentStep={currentStep}
          onStepChange={onStepChange}
        />

        {/* Main Content - Stack vertically on mobile, horizontally on desktop */}
        <div
          className="flex-1 flex flex-col lg:flex-row h-full w-full"
          style={{ overflow: "hidden" }}
        >
          {/* Left Container - Hidden on mobile/tablet (handled by hamburger), visible on desktop */}
          <div
            className="hidden lg:flex w-3/12 xl:w-1/4 flex-shrink-0 relative z-[75]"
            style={{
              backgroundColor: "#212327",
              padding: "16px",
              overflow: "hidden",
              minHeight: "200px",
            }}
          >
            <div className="h-full overflow-y-auto">{leftContent}</div>
          </div>

          {/* Right Container - Full width on mobile/tablet, proportional on desktop */}
          <div
            className="w-full lg:w-9/12 xl:w-3/4 flex flex-col"
            style={{ overflow: "hidden" }}
          >
            {/* Content Area */}
            <div
              className="h-full overflow-y-auto px-4 lg:px-6"
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
    <div
      className="w-full"
      style={{
        backgroundColor: "#1B1D21",
        overflow: "hidden",
        height: containerHeight,
      }}
    >
      {/* Main Content Area */}
      <div
        className="h-full flex flex-col"
        style={{
          marginLeft: user ? navState.navMargin : "0px",
          overflow: "hidden",
        }}
      >
        {/* ViewTitle Container */}
        {showViewTitle && (
          <div
            className="w-full bg-[#1e2327] flex items-center justify-between border-b border-[#454446] h-16"
            style={{
              height: "64px !important",
              minHeight: "64px",
              maxHeight: "64px",
              paddingLeft: "12px",
              paddingRight: "32px",
            }}
          >
            {/* Title text */}
            <div className="font-semibold text-[#ffffff] text-[18px] whitespace-nowrap">
              {viewTitleText}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="px-4 py-2 text-sm font-medium transition-colors bg-gray-600 text-white rounded hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? "Signing out..." : "Logout"}
            </button>
          </div>
        )}

        {/* Parent Container for Left and Right */}
        <div className="flex h-full flex-1" style={{ overflow: "hidden" }}>
          {/* Left Container - Hidden on mobile/tablet (handled by hamburger), visible on desktop */}
          <div
            className="hidden lg:flex w-3/12 flex-shrink-0 flex"
            style={{
              backgroundColor: "#212327",
              padding: "0px",
              overflow: "hidden",
              maxWidth: "25%",
            }}
          >
            {/* Awards Generator Side Navigation - Now inside left container */}
            <div className="w-[94px] h-full">
              <DigitalAwardsSideNav
                currentStep={currentStep}
                onStepChange={onStepChange}
              />
            </div>

            {/* Content area */}
            <div
              className="flex-1"
              style={{
                backgroundColor: "#212327",
                padding: "0px",
                overflow: "hidden",
              }}
            >
              {leftContent}
            </div>
          </div>

          {/* Right Container - Full width on mobile/tablet, proportional on desktop */}
          <div
            className="w-full lg:w-9/12 flex flex-col"
            style={{ overflow: "hidden" }}
          >
            {/* Sticky Header */}
            <div
              className="flex-shrink-0 px-4 lg:px-6 pt-4 lg:pt-5"
              style={{
                backgroundColor: "#1B1D21",
                position: "sticky",
                top: 0,
                zIndex: 10,
              }}
            >
              <h1 className="text-[24px] lg:text-[30px] font-bold text-white mb-3 lg:mb-4">
                {viewTitleText}
              </h1>
            </div>

            {/* Content Area */}
            <div
              className="flex-1 overflow-y-auto px-4 lg:px-6"
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
