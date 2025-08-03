'use client';

import React, { useState } from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import SideNavAuth from './side_nav_auth';
import SideNavCollapsed from './side_nav_collapsed';

export default function SideNavigation() {
  const { isCollapsed } = useNavigation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Function to close mobile menu
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:block">
        {isCollapsed ? <SideNavCollapsed /> : <SideNavAuth />}
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        {/* Hamburger Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="fixed top-3 left-3 z-40 p-2 bg-[#1F2327] rounded-lg border border-[#454446] hover:bg-[#2a2e32] transition-colors"
        >
          <img
            src="/skilltrait_icon.svg"
            alt="SkillTrait"
            className="w-6 h-6"
          />
        </button>

        {/* Mobile Navigation Overlay */}
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
              onClick={closeMobileMenu}
            />
            
            {/* Mobile Navigation Container */}
            <div
              className="fixed left-0 top-0 h-full w-[280px] bg-[#1F2327] border-r border-[#454446] z-50 transform transition-transform duration-300 ease-in-out"
              style={{ transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)' }}
            >
              {/* Close Button */}
              <button
                onClick={closeMobileMenu}
                className="absolute top-3 right-3 p-2 text-white hover:bg-[#2a2e32] rounded-lg transition-colors z-10"
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
              <div className="h-full flex flex-col">
                <SideNavAuth onNavigationClick={closeMobileMenu} isMobileOpen={isMobileMenuOpen} />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

// Hook to get the current margin for main content
export const useSideNavMargin = () => {
  const { isCollapsed } = useNavigation();
  return isCollapsed ? 'ml-[66px]' : 'ml-60';
}; 