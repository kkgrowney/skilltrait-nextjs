"use client";

import { useState, useEffect } from 'react';
import SideNavigation, { useSideNavMargin } from '@/components/SideNavigation';
import { useAuth } from '@/contexts/AuthContext';

export default function VerificationsPage() {
  const { user } = useAuth();
  const sideNavMargin = useSideNavMargin();
  const [verificationTitles, setVerificationTitles] = useState<string[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'props' | 'image' | 'link'>('props');
  const [isPublic, setIsPublic] = useState(false);
  const [currentStep, setCurrentStep] = useState<'props' | 'tags'>('props');
  const [skillsSearchQuery, setSkillsSearchQuery] = useState('');
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [unselectedSkills, setUnselectedSkills] = useState<string[]>([]);
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);
  const [selectedSkillIndex, setSelectedSkillIndex] = useState(-1);
  const [selectedDateTab, setSelectedDateTab] = useState<'none' | 'range' | 'milestone' | 'current'>('none');
  const [rangeStartDate, setRangeStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [rangeEndDate, setRangeEndDate] = useState<string>('');
  const [milestoneDate, setMilestoneDate] = useState<string>('');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const handleAddTitle = () => {
    if (newTitle.trim()) {
      setVerificationTitles([...verificationTitles, newTitle.trim()]);
      setNewTitle('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTitle();
    }
  };

  const handleSourceSelect = (source: string) => {
    setSelectedSource(source);
  };

  const handleCloseSourceDetail = () => {
    setSelectedSource(null);
  };

  const handleNext = () => {
    setCurrentStep('tags');
  };

  const handleBack = () => {
    setCurrentStep('props');
  };

  const handleAddSkill = (skill: string) => {
    if (!selectedSkills.includes(skill)) {
      const newSelectedSkills = [skill, ...selectedSkills];
      setSelectedSkills(newSelectedSkills);
    }
    setSkillsSearchQuery('');
    setShowSkillsDropdown(false);
  };

  const handleRemoveSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill));
    setUnselectedSkills(unselectedSkills.filter(s => s !== skill));
  };

  const handleUnselectSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill));
    if (!unselectedSkills.includes(skill)) {
      setUnselectedSkills([...unselectedSkills, skill]);
    }
  };

  const handleReselectSkill = (skill: string) => {
    setUnselectedSkills(unselectedSkills.filter(s => s !== skill));
    if (!selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  // Calendar functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedCalendarDate(newDate);
    
    if (selectedDateTab === 'milestone') {
      // For milestone, just set the milestone date
      setMilestoneDate(formatDate(newDate));
    } else if (selectedDateTab === 'range') {
      // If no start date is set, set it as start date
      if (!rangeStartDate) {
        setRangeStartDate(formatDate(newDate));
      } else if (!rangeEndDate) {
        // If start date is set but no end date, set as end date
        setRangeEndDate(formatDate(newDate));
      } else {
        // If both are set, reset and set new start date
        setRangeStartDate(formatDate(newDate));
        setRangeEndDate('');
      }
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const handleSkillSearch = (query: string) => {
    setSkillsSearchQuery(query);
    setSelectedSkillIndex(-1); // Reset selection when search changes
    if (query.trim()) {
      // Mock skills data - in real app, this would come from an API
      const mockSkills = [
        'JavaScript', 'React', 'TypeScript', 'Node.js', 'Python', 'Java', 'C++', 'SQL',
        'HTML', 'CSS', 'Vue.js', 'Angular', 'Express.js', 'MongoDB', 'PostgreSQL',
        'AWS', 'Docker', 'Git', 'Linux', 'Machine Learning', 'Data Analysis'
      ];
      const filteredSkills = mockSkills.filter(skill => 
        skill.toLowerCase().includes(query.toLowerCase()) && 
        !selectedSkills.includes(skill) &&
        !unselectedSkills.includes(skill)
      );
      setAvailableSkills(filteredSkills);
      setShowSkillsDropdown(true);
    } else {
      setShowSkillsDropdown(false);
    }
  };

  const handleSkillsKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedSkillIndex >= 0 && availableSkills[selectedSkillIndex]) {
        // Add selected skill from dropdown
        handleAddSkill(availableSkills[selectedSkillIndex]);
      } else if (skillsSearchQuery.trim()) {
        // Add current search query as new skill
        handleAddSkill(skillsSearchQuery.trim());
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (showSkillsDropdown && availableSkills.length > 0) {
        setSelectedSkillIndex(prev => 
          prev < availableSkills.length - 1 ? prev + 1 : 0
        );
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (showSkillsDropdown && availableSkills.length > 0) {
        setSelectedSkillIndex(prev => 
          prev > 0 ? prev - 1 : availableSkills.length - 1
        );
      }
    } else if (e.key === 'Escape') {
      setShowSkillsDropdown(false);
      setSelectedSkillIndex(-1);
    }
  };

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
              
              {/* Responsive two-column layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Getting Started */}
                <div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Getting Started</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      Start by adding verification sources to build your professional credibility. 
                      You can connect external platforms, upload certificates, or link to achievements 
                      that validate your skills and experience.
                    </p>
                    
                    {/* Break line */}
                    <div className="border-t border-[#454446] my-4"></div>
                    
                    {/* Display added verification titles */}
                    {verificationTitles.length > 0 && (
                      <div className="mt-4">
                        <div className="text-white font-semibold text-lg mb-3">Sources</div>
                        {verificationTitles.map((title, index) => (
                          <div 
                            key={index} 
                            className={`font-bold text-lg mb-2 hover:underline cursor-pointer ${
                              selectedSource === title ? 'text-[#00DF71]' : 'text-white'
                            }`}
                            onClick={() => handleSourceSelect(title)}
                          >
                            {title}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Add Source or Source Detail */}
                <div>
                  <div className="space-y-6">
                    {selectedSource ? (
                      /* Source Detail Container */
                      <div className="bg-[#1e2327] rounded-lg border border-[#454446] h-full p-6">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center space-x-4">
                            <h4 className="text-xl font-semibold text-white">{selectedSource}</h4>
                            {/* Public Toggle */}
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => setIsPublic(!isPublic)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#00DF71] focus:ring-offset-2 focus:ring-offset-[#1e2327] ${
                                  isPublic ? 'bg-[#00DF71]' : 'bg-[#454446]'
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    isPublic ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                              <span className={`text-sm font-medium ${isPublic ? 'text-[#00DF71]' : 'text-gray-300'}`}>
                                Public
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={handleCloseSourceDetail}
                            className="flex items-center justify-center w-8 h-8 border border-[#454446] hover:border-[#00DF71] text-white hover:text-[#00DF71] rounded-full transition-colors text-lg font-bold"
                          >
                            ×
                          </button>
                        </div>
                        
                        {/* Tabs */}
                        <div className="flex border-b border-[#454446] mb-6">
                          <button
                            onClick={() => setActiveTab('props')}
                            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                              activeTab === 'props'
                                ? 'text-white border-b-2'
                                : 'text-gray-300 hover:text-white'
                            }`}
                            style={{
                              borderBottomColor: activeTab === 'props' ? '#00DF71' : 'transparent',
                            }}
                          >
                            Props
                          </button>
                          <button
                            onClick={() => setActiveTab('image')}
                            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                              activeTab === 'image'
                                ? 'text-white border-b-2'
                                : 'text-gray-300 hover:text-white'
                            }`}
                            style={{
                              borderBottomColor: activeTab === 'image' ? '#00DF71' : 'transparent',
                            }}
                          >
                            Image
                          </button>
                          <button
                            onClick={() => setActiveTab('link')}
                            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                              activeTab === 'link'
                                ? 'text-white border-b-2'
                                : 'text-gray-300 hover:text-white'
                            }`}
                            style={{
                              borderBottomColor: activeTab === 'link' ? '#00DF71' : 'transparent',
                            }}
                          >
                            Link
                          </button>
                        </div>
                        
                        {/* Source Detail Content */}
                        <div className="relative overflow-hidden">
                          <div 
                            className={`flex transition-transform duration-300 ease-in-out ${
                              currentStep === 'tags' ? '-translate-x-full' : 'translate-x-0'
                            }`}
                          >
                            {/* Props Step Content */}
                            <div className="w-full flex-shrink-0 space-y-6">
                          <div className="bg-[#212327] rounded-lg border border-[#454446] p-4">
                            <h5 className="text-md font-semibold text-white mb-3">Description</h5>
                            <div className="space-y-3">
                              <textarea
                                placeholder="Enter description for this verification source..."
                                maxLength={160}
                                rows={3}
                                className="w-full bg-[#1A1D21] border border-[#454446] rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#00DF71] transition-colors resize-none"
                              />
                              <div className="text-sm text-gray-400">
                                <span className="text-gray-400">
                                  160 characters maximum
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-[#212327] rounded-lg border border-[#454446] p-4">
                            <div className="flex items-center space-x-4">
                              <h5 className="text-md font-semibold text-white flex-shrink-0">URL/Link</h5>
                              <input
                                type="url"
                                placeholder="Enter verification URL or link..."
                                className="flex-1 bg-[#1A1D21] border border-[#454446] rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#00DF71] transition-colors"
                              />
                            </div>
                          </div>
                          
                          <div className="bg-[#212327] rounded-lg border border-[#454446] p-4">
                            <h5 className="text-md font-semibold text-white mb-3">Upload Image</h5>
                            <div className="border-2 border-dashed border-[#454446] rounded-lg p-5 text-center hover:border-[#00DF71] transition-colors cursor-pointer">
                              <div className="text-gray-400 mb-2">
                                <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </div>
                              <p className="text-gray-300 text-sm">Drag to upload</p>
                              <p className="text-gray-500 text-xs mt-1">or click to browse</p>
                            </div>
                          </div>
                          
                            </div>
                            
                            {/* Tags Step Content */}
                            <div className="w-full flex-shrink-0 space-y-6">
                              <div className="bg-[#212327] rounded-lg border border-[#454446] p-4">
                                <h5 className="text-md font-semibold text-white mb-3">Add Skills</h5>
                                <div className="relative">
                                  <input
                                    type="text"
                                    placeholder="Search for skills..."
                                    value={skillsSearchQuery}
                                    onChange={(e) => handleSkillSearch(e.target.value)}
                                    onFocus={() => setShowSkillsDropdown(skillsSearchQuery.trim() !== '')}
                                    onKeyDown={handleSkillsKeyDown}
                                    className="w-full bg-[#1A1D21] border border-[#454446] rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#00DF71] transition-colors"
                                  />
                                  
                                  {/* Skills Dropdown */}
                                  {showSkillsDropdown && availableSkills.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#1A1D21] border border-[#454446] rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                                      {availableSkills.map((skill, index) => (
                                        <button
                                          key={index}
                                          onClick={() => handleAddSkill(skill)}
                                          className={`w-full text-left px-4 py-2 text-white transition-colors ${
                                            index === selectedSkillIndex 
                                              ? 'bg-[#2a2e32] text-white' 
                                              : 'hover:bg-[#2a2e32]'
                                          }`}
                                        >
                                          {skill}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                
                                {/* My Skills Section */}
                                {(selectedSkills.length > 0 || unselectedSkills.length > 0) && (
                                  <div className="mt-4">
                                    <h6 className="text-sm font-medium text-gray-300 mb-2">My Skills</h6>
                                    <div className="flex flex-wrap gap-2">
                                      {/* Selected Skills */}
                                      {selectedSkills.map((skill, index) => (
                                        <div
                                          key={`selected-${index}`}
                                          className="flex items-center gap-2 bg-[#00DF71] text-[#212327] px-3 py-1 rounded-full text-sm font-medium"
                                        >
                                          <span 
                                            className="cursor-pointer"
                                            onClick={() => handleUnselectSkill(skill)}
                                          >
                                            {skill}
                                          </span>
                                          <button
                                            onClick={() => handleRemoveSkill(skill)}
                                            className="hover:border hover:border-[#212327] rounded-full w-5 h-5 flex items-center justify-center transition-colors"
                                          >
                                            ×
                                          </button>
                                        </div>
                                      ))}
                                      
                                      {/* Unselected Skills */}
                                      {unselectedSkills.map((skill, index) => (
                                        <div
                                          key={`unselected-${index}`}
                                          className="flex items-center gap-2 bg-[#2a2e32] text-gray-400 px-3 py-1 rounded-full text-sm font-medium border border-[#454446]"
                                        >
                                          <span 
                                            className="cursor-pointer hover:text-white transition-colors"
                                            onClick={() => handleReselectSkill(skill)}
                                          >
                                            {skill}
                                          </span>
                                          <button
                                            onClick={() => handleRemoveSkill(skill)}
                                            className="hover:border hover:border-gray-400 rounded-full w-5 h-5 flex items-center justify-center transition-colors"
                                          >
                                            ×
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              <div className="bg-[#212327] rounded-lg border border-[#454446] p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h5 className="text-md font-semibold text-white">Date</h5>
                                  <div className="flex space-x-1">
                                    {['None', 'Range', 'Milestone', 'Current'].map((tab) => (
                                      <button
                                        key={tab}
                                        onClick={() => setSelectedDateTab(tab.toLowerCase() as 'none' | 'range' | 'milestone' | 'current')}
                                        className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                                          selectedDateTab === tab.toLowerCase()
                                            ? 'bg-[#00DF71] text-[#212327]'
                                            : 'bg-[#454446] text-gray-300 hover:text-white'
                                        }`}
                                      >
                                        {tab}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                {selectedDateTab === 'none' ? (
                                  <input
                                    type="text"
                                    value="No date for source"
                                    readOnly
                                    className="w-full bg-[#2a2e32] border border-[#454446] rounded-lg px-4 py-3 text-gray-500 cursor-not-allowed"
                                  />
                                ) : (selectedDateTab === 'range' || selectedDateTab === 'milestone') ? (
                                  <div className="space-y-4">
                                    {/* Calendar Component */}
                                    <div className="bg-[#1A1D21] border border-[#454446] rounded-lg p-4">
                                      {/* Calendar Header */}
                                      <div className="flex items-center justify-between mb-4">
                                        <button
                                          onClick={() => navigateMonth('prev')}
                                          className="p-2 hover:bg-[#2a2e32] rounded-lg transition-colors"
                                        >
                                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                          </svg>
                                        </button>
                                        <h3 className="text-lg font-semibold text-white">
                                          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                        </h3>
                                        <button
                                          onClick={() => navigateMonth('next')}
                                          className="p-2 hover:bg-[#2a2e32] rounded-lg transition-colors"
                                        >
                                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                          </svg>
                                        </button>
                                      </div>
                                      
                                      {/* Calendar Grid */}
                                      <div className="grid grid-cols-7 gap-1">
                                        {/* Day Headers */}
                                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                          <div key={day} className="p-2 text-center text-sm font-medium text-gray-400">
                                            {day}
                                          </div>
                                        ))}
                                        
                                        {/* Calendar Days */}
                                        {Array.from({ length: getFirstDayOfMonth(currentMonth) }, (_, i) => (
                                          <div key={`empty-${i}`} className="p-2"></div>
                                        ))}
                                        
                                        {Array.from({ length: getDaysInMonth(currentMonth) }, (_, i) => {
                                          const day = i + 1;
                                          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                                          const dateString = formatDate(date);
                                          const isSelected = selectedCalendarDate && formatDate(selectedCalendarDate) === dateString;
                                          const isStartDate = rangeStartDate === dateString;
                                          const isEndDate = rangeEndDate === dateString;
                                          const isMilestoneDate = milestoneDate === dateString;
                                          const isToday = dateString === new Date().toISOString().split('T')[0];
                                          
                                          return (
                                            <button
                                              key={day}
                                              onClick={() => handleDateClick(day)}
                                              className={`p-2 text-sm rounded-lg transition-colors ${
                                                isSelected || isStartDate || isEndDate || isMilestoneDate
                                                  ? 'bg-[#00DF71] text-[#212327] font-semibold'
                                                  : isToday
                                                  ? 'bg-[#2a2e32] text-white font-semibold'
                                                  : 'text-white hover:bg-[#2a2e32]'
                                              }`}
                                            >
                                              {day}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                    
                                    {/* Date Fields - Different for Range vs Milestone */}
                                    {selectedDateTab === 'range' ? (
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                                          <div className="relative">
                                            <input
                                              type="date"
                                              value={rangeStartDate}
                                              onChange={(e) => setRangeStartDate(e.target.value)}
                                              className="w-full bg-[#1A1D21] border border-[#454446] rounded-lg px-4 py-3 pr-10 text-white focus:outline-none focus:border-[#00DF71] transition-colors [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                            />
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                              </svg>
                                            </div>
                                          </div>
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                                          <div className="relative">
                                            <input
                                              type="date"
                                              value={rangeEndDate}
                                              onChange={(e) => setRangeEndDate(e.target.value)}
                                              placeholder="Choose date"
                                              className="w-full bg-[#1A1D21] border border-[#454446] rounded-lg px-4 py-3 pr-10 text-white focus:outline-none focus:border-[#00DF71] transition-colors [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                            />
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                              </svg>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ) : selectedDateTab === 'milestone' ? (
                                      <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Milestone</label>
                                        <div className="relative">
                                          <input
                                            type="date"
                                            value={milestoneDate}
                                            onChange={(e) => setMilestoneDate(e.target.value)}
                                            className="w-full bg-[#1A1D21] border border-[#454446] rounded-lg px-4 py-3 pr-10 text-white focus:outline-none focus:border-[#00DF71] transition-colors [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                          />
                                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                          </div>
                                        </div>
                                      </div>
                                    ) : null}
                                  </div>
                                ) : (
                                  <input
                                    type="date"
                                    className="w-full bg-[#1A1D21] border border-[#454446] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00DF71] transition-colors"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Navigation Buttons - Fixed Position */}
                          <div className={`flex pt-4 ${currentStep === 'tags' ? 'justify-between' : 'justify-end'}`}>
                            {currentStep === 'tags' && (
                              <button 
                                onClick={handleBack}
                                className="px-6 py-3 text-sm font-medium transition-colors bg-[#454446] text-white rounded hover:bg-[#5a5c5e]"
                              >
                                Back
                              </button>
                            )}
                            <button 
                              onClick={handleNext}
                              className="px-6 py-3 text-sm font-medium transition-colors bg-[#00DF71] text-[#212327] rounded hover:bg-[#0AFB84]"
                            >
                              {currentStep === 'tags' ? 'Save' : 'Next'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Add Source Section */
                      <div className="bg-[#1e2327] rounded-lg border border-[#454446] p-4">
                        <h4 className="text-md font-semibold text-white mb-3">Add Source <span style={{ color: "#ED6568" }}>*</span></h4>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            placeholder="Add a title for verification source..."
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="flex-1 bg-[#1A1D21] border border-[#454446] rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#00DF71] transition-colors"
                          />
                          <button 
                            onClick={handleAddTitle}
                            className="px-4 py-3 text-sm font-medium transition-colors bg-[#00DF71] text-[#212327] rounded hover:bg-[#0AFB84]"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
