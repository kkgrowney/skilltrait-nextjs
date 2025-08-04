'use client';

import React from 'react';

interface ViewTitleTabProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function ViewTitleTab({ activeTab, onTabChange }: ViewTitleTabProps) {
  return (
    <div className="flex items-center border-b border-[#454446] bg-[#1e2327] px-8" style={{ marginTop: '-12px' }}>
      <div className="flex space-x-8">
        <button
          onClick={() => onTabChange('admin')}
          className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'admin'
              ? 'border-[#00DF71] text-[#00DF71]'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
        >
          Admin
        </button>
        <button
          onClick={() => onTabChange('employees')}
          className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'employees'
              ? 'border-[#00DF71] text-[#00DF71]'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
        >
          Employees
        </button>
      </div>
    </div>
  );
} 