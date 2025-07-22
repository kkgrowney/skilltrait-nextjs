'use client';

import { useState } from 'react';

interface AwardsStepProps {
  onTabChange: (tab: 'props' | 'achievements') => void;
}

export default function AwardsStep({ onTabChange }: AwardsStepProps) {
  const [awardType, setAwardType] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [achievement, setAchievement] = useState('');
  const [activeTab, setActiveTab] = useState<'props' | 'achievements'>('props');
  const [filters, setFilters] = useState({
    anniversary: false,
    leadership: false,
    free: false,
    company: false
  });





  const toggleFilter = (filterName: keyof typeof filters) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  return (
    <div className="h-full flex flex-col">
      <div className="text-center mb-8">
        <h1 className="text-[30px] font-bold text-white mb-4">
          Awards
        </h1>
        <p className="text-md text-gray-300 mb-0">
          Create professional digital awards and certificates to recognize achievements and milestones.
        </p>
      </div>
      
      {/* Tab Component */}
      <div className="mb-6">
        <div className="flex border-b" style={{borderColor: '#454446'}}>
          <button
            onClick={() => {
              setActiveTab('props');
              onTabChange('props');
            }}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              activeTab === 'props'
                ? 'text-white border-b-2' 
                : 'text-gray-300 hover:text-white'
            }`}
            style={{
              borderBottomColor: activeTab === 'props' ? 'var(--primary-dark)' : 'transparent'
            }}
          >
            Props
          </button>
          <button
            onClick={() => {
              setActiveTab('achievements');
              onTabChange('achievements');
            }}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              activeTab === 'achievements'
                ? 'text-white border-b-2' 
                : 'text-gray-300 hover:text-white'
            }`}
            style={{
              borderBottomColor: activeTab === 'achievements' ? 'var(--primary-dark)' : 'transparent'
            }}
          >
            Achievements
          </button>
        </div>
      </div>
      
      {/* Search Box */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search templates..."
            className="w-full px-4 py-3 text-sm bg-[#1B1D21] border rounded text-white placeholder-gray-400 focus:outline-none focus:border-[var(--primary-dark)]"
            style={{borderColor: '#454446'}}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-white mb-3">Filters</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => toggleFilter('anniversary')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              filters.anniversary
                ? 'bg-[var(--primary-dark)] text-[#212327]'
                : 'bg-[#1B1D21] border text-gray-300 hover:text-white'
            }`}
            style={{borderColor: filters.anniversary ? 'transparent' : '#454446'}}
          >
            Anniversary
          </button>
          <button
            onClick={() => toggleFilter('leadership')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              filters.leadership
                ? 'bg-[var(--primary-dark)] text-[#212327]'
                : 'bg-[#1B1D21] border text-gray-300 hover:text-white'
            }`}
            style={{borderColor: filters.leadership ? 'transparent' : '#454446'}}
          >
            Leadership
          </button>
          <button
            onClick={() => toggleFilter('free')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              filters.free
                ? 'bg-[var(--primary-dark)] text-[#212327]'
                : 'bg-[#1B1D21] border text-gray-300 hover:text-white'
            }`}
            style={{borderColor: filters.free ? 'transparent' : '#454446'}}
          >
            Free
          </button>
          <button
            onClick={() => toggleFilter('company')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              filters.company
                ? 'bg-[var(--primary-dark)] text-[#212327]'
                : 'bg-[#1B1D21] border text-gray-300 hover:text-white'
            }`}
            style={{borderColor: filters.company ? 'transparent' : '#454446'}}
          >
            Company
          </button>
        </div>
      </div>
      

    </div>
  );
} 