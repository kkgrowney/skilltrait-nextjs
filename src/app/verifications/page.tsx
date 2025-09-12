"use client";

import { useState, useEffect } from 'react';
import SideNavigation, { useSideNavMargin } from '@/components/SideNavigation';
import { useAuth } from '@/contexts/AuthContext';

export default function VerificationsPage() {
  const { user } = useAuth();
  const sideNavMargin = useSideNavMargin();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#1B1D21" }}>
      <SideNavigation />
      
      <div className={`${sideNavMargin} h-full flex flex-col`}>
        {/* Fixed Header Container */}
        <div className="flex-shrink-0 z-20">
          {/* ViewTitle Container */}
          <div className="w-full bg-[#1e2327] flex items-center h-16 border-b border-[#454446]" style={{ height: "64px !important", minHeight: "64px", maxHeight: "64px", paddingLeft: "32px" }}>
            {/* Title text */}
            <div className="font-semibold text-[#ffffff] text-[18px] whitespace-nowrap md:ml-0 ml-9 flex items-center">
              Verifications
            </div>
          </div>
        </div>
        
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8" style={{ height: 'calc(100vh - 64px)' }}>
          <div className="max-w-6xl">
            <div className="bg-[#212327] rounded-lg shadow-sm border border-[#454446] p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-6">My Verifications</h2>
              
              {/* Placeholder content */}
              <div className="text-gray-400 text-center py-12">
                <p className="text-lg mb-4">No verifications yet</p>
                <p className="text-sm">Your verifications will appear here once you start earning them.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
