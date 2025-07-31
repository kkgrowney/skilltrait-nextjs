'use client';

import React, { useState } from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import SideNavAuth from './side_nav_auth';
import SideNavCollapsed from './side_nav_collapsed';

export default function SideNavigation() {
  const { isCollapsed } = useNavigation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Mobile overlay component
  const MobileOverlay = () => (
    <>
      {/* Hamburger Menu Button - Only visible on mobile */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-[#1F2327] rounded-lg border border-[#454446]"
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Mobile Navigation Container */}
          <div
            className="md:hidden fixed left-0 top-0 h-full w-[70vw] bg-[#1F2327] border-r border-[#454446] z-50 transform transition-transform duration-300 ease-in-out"
            style={{ transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)' }}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 text-white hover:bg-[#2a2e32] rounded-lg transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Mobile Navigation Content */}
            <div className="h-full flex flex-col justify-between pt-16">
              <SideNavAuth />
            </div>
          </div>
        </>
      )}
    </>
  );

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:block">
        {isCollapsed ? <SideNavCollapsed /> : <SideNavAuth />}
      </div>

      {/* Mobile Navigation */}
      <MobileOverlay />
    </>
  );
}

// Hook to get the current margin for main content
export const useSideNavMargin = () => {
  const { isCollapsed } = useNavigation();
  return isCollapsed ? 'ml-[66px]' : 'ml-60';
}; 