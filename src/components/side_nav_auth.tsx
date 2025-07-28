'use client';

import React from 'react';
import { useNavigation } from '@/contexts/NavigationContext';

export default function SideNavAuth() {
  const { toggleCollapsed } = useNavigation();

  return (
    <aside className="bg-[#1F2327] w-60 h-screen fixed left-0 top-0 flex flex-col justify-between border-r border-[#454446]">
      {/* Top Section */}
      <div className="flex flex-col gap-2 p-3">
        {/* SkillTrait Logo */}
        <div className="h-[38px] relative flex justify-center items-center mb-2">
          <img 
            src="/skilltrait_dark.svg" 
            alt="SkillTrait" 
            className="h-6 w-auto"
          />
          <img 
            src="/chevron-double-left-outline.svg" 
            alt="Collapse" 
            className="h-3 w-3 absolute right-0 cursor-pointer hover:opacity-80"
            style={{ filter: 'brightness(0) saturate(100%) invert(84%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(89%) contrast(86%)' }}
            onClick={toggleCollapsed}
          />
        </div>
        
        {/* Main Navigation */}
        <nav className="flex flex-col gap-2">
          {/* Home - Active State */}
          <div className="bg-[#181d21] flex items-center p-2 rounded-lg">
            <div className="flex items-center gap-3 pl-2">
              <img 
                src="/home.svg" 
                alt="Home" 
                className="h-5 w-5"
                style={{ filter: 'brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)' }}
              />
              <span className="text-[#00df71] font-medium text-base">Home</span>
            </div>
          </div>
          
          {/* Companies - Inactive State */}
          <div className="flex items-center p-2 rounded-lg hover:bg-[#202327]">
            <div className="flex items-center gap-3 pl-2">
              <img 
                src="/company.svg" 
                alt="Companies" 
                className="h-5 w-5"
                style={{ filter: 'brightness(0) saturate(100%) invert(84%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(89%) contrast(86%)' }}
              />
              <span className="text-[#79828a] font-medium text-base">Companies</span>
            </div>
          </div>
        </nav>
      </div>
      
      {/* Bottom CTA */}
      <div className="p-3 mt-auto mb-6">
        <button className="w-full bg-[#00dc79] text-[#2b2a2d] font-medium text-xs rounded-lg py-2">Try Premium for 30 days</button>
      </div>
    </aside>
  );
} 