'use client';

import React from 'react';

interface ProfileViewTitleTabProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function ProfileViewTitleTab({ activeTab, onTabChange }: ProfileViewTitleTabProps) {
  return (
    <div className="flex items-center border-b border-[#454446] bg-[#1e2327] px-8" style={{ marginTop: '-12px' }}>
      <div className="flex space-x-8">
        <button
          onClick={() => onTabChange('summary')}
          className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'summary'
              ? 'border-[#00DF71] text-[#00DF71]'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
        >
          Summary
        </button>
        <button
          onClick={() => onTabChange('skills')}
          className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'skills'
              ? 'border-[#00DF71] text-[#00DF71]'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
        >
          Skills
        </button>
        <button
          onClick={() => onTabChange('settings')}
          className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'settings'
              ? 'border-[#00DF71] text-[#00DF71]'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
        >
          Settings
        </button>
      </div>
    </div>
  );
}
