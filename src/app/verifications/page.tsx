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
                          <h4 className="text-xl font-semibold text-white">{selectedSource}</h4>
                          <button
                            onClick={handleCloseSourceDetail}
                            className="flex items-center justify-center w-8 h-8 border border-[#454446] hover:border-[#00DF71] text-white hover:text-[#00DF71] rounded-full transition-colors text-lg font-bold"
                          >
                            ×
                          </button>
                        </div>
                        
                        {/* Source Detail Content */}
                        <div className="space-y-6">
                          <div className="bg-[#212327] rounded-lg border border-[#454446] p-4">
                            <h5 className="text-md font-semibold text-white mb-3">Description</h5>
                            <textarea
                              placeholder="Enter description for this verification source..."
                              rows={4}
                              className="w-full bg-[#1A1D21] border border-[#454446] rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#00DF71] transition-colors resize-none"
                            />
                          </div>
                          
                          <div className="bg-[#212327] rounded-lg border border-[#454446] p-4">
                            <h5 className="text-md font-semibold text-white mb-3">URL/Link</h5>
                            <input
                              type="url"
                              placeholder="Enter verification URL or link..."
                              className="w-full bg-[#1A1D21] border border-[#454446] rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#00DF71] transition-colors"
                            />
                          </div>
                          
                          <div className="bg-[#212327] rounded-lg border border-[#454446] p-4">
                            <h5 className="text-md font-semibold text-white mb-3">Date Verified</h5>
                            <input
                              type="date"
                              className="w-full bg-[#1A1D21] border border-[#454446] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00DF71] transition-colors"
                            />
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
