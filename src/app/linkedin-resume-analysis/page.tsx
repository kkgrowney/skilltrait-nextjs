'use client';

import { useState } from 'react';
import LinkedComparisonChart from '@/components/LinkedComparisonChart';
import ConsistencyAnalysisChart from '@/components/ConsistencyAnalysisChart';
import SkillComparisonChart from '@/components/SkillComparisonChart';

export default function LinkedCVComparisonPage() {
  const [linkedinContent, setLinkedinContent] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('candidates');

  const handleRunComparison = async () => {
    console.log('handleRunComparison called');
    console.log('linkedinContent length:', linkedinContent.length);
    console.log('resumeText length:', resumeText.length);
    
    if (!linkedinContent.trim()) {
      console.log('No LinkedIn content');
      setResults('Please paste your LinkedIn profile content.');
      return;
    }

    if (!resumeText.trim()) {
      console.log('No resume content');
      setResults('Please paste your resume text.');
      return;
    }

    console.log('Starting comparison...');
    setIsLoading(true);
    setResults('');

    try {
      const formData = new FormData();
      formData.append('linkedinContent', linkedinContent);
      formData.append('resumeText', resumeText);

      console.log('Sending request to API...');
      const response = await fetch('/api/compare-licv', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        console.log('Setting results:', data.result);
        setResults(data.result);
      } else {
        // Use the specific error message from the API
        const errorMessage = data.error || 'Failed to run comparison';
        console.log('Setting error:', errorMessage);
        setResults(`Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error running comparison:', error);
      setResults('Error running comparison. Please try again.');
    } finally {
      console.log('Setting loading to false');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{backgroundColor: '#1B1D21'}}>
      {/* Main Content with Fixed Nav Offset */}
      <div className="h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 h-full">
          {/* Left Container - Scrollable, Full Height */}
          <div className="lg:col-span-4 order-2 lg:order-1 h-full overflow-y-auto">
            <div className="h-full" style={{backgroundColor: '#212327', padding: '20px'}}>
              <div className="text-center mb-8">
                <h1 className="text-[30px] font-bold text-white mb-4">
                  LinkedIn and Resume Analysis
                </h1>
                <p className="text-md text-gray-300 mb-6">
                  Run a comparison check of a LinkedIn profile and resume to verify consistency and review expertise in skills.
                </p>
                
                {/* Tab Component */}
                <div className="bg-[#212327] rounded-[10px] p-1 mb-6">
                  <div className="flex items-center">
                    <button
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                        activeTab === 'candidates' 
                          ? 'bg-[#454446] text-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]' 
                          : 'text-gray-400 hover:text-gray-300'
                      }`}
                      onClick={() => setActiveTab('candidates')}
                    >
                      For Candidates
                    </button>
                    <button
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                        activeTab === 'recruiters' 
                          ? 'bg-[#454446] text-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]' 
                          : 'text-gray-400 hover:text-gray-300'
                      }`}
                      onClick={() => setActiveTab('recruiters')}
                    >
                      For Recruiters
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 rounded-sm border" style={{backgroundColor: '#1B1D21', borderColor: '#454446'}}>
                  <h3 className="text-lg font-medium text-white mb-2">LinkedIn profile *</h3>
                  <textarea 
                    placeholder="Paste LinkedIn profile content here... (Required)"
                    value={linkedinContent}
                    onChange={(e) => setLinkedinContent(e.target.value)}
                    className="w-full px-4 py-2 text-sm bg-[#1B1D21] border rounded text-white placeholder-gray-400 focus:outline-none focus:border-[var(--primary-dark)] resize-none"
                    rows={8}
                    style={{minHeight: '160px', maxHeight: '240px', borderColor: '#454446'}}
                  />
                  <p className="text-gray-300 text-sm mt-2">Copy and paste your LinkedIn profile content for comparison with your resume.</p>
                </div>
                
                <div className="p-4 rounded-sm border" style={{backgroundColor: '#1B1D21', borderColor: '#454446'}}>
                  <h3 className="text-lg font-medium text-white mb-2">Resume *</h3>
                  <textarea 
                    placeholder="Paste your resume text here... (Required)"
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    className="w-full px-4 py-2 text-sm bg-[#1B1D21] border rounded text-white placeholder-gray-400 focus:outline-none focus:border-[var(--primary-dark)] resize-none"
                    rows={8}
                    style={{minHeight: '160px', maxHeight: '240px', borderColor: '#454446'}}
                  />
                  <p className="text-gray-300 text-sm mt-2">
                    Copy and paste your resume text here. If you have a PDF, open it and copy the text content manually.
                  </p>
                </div>
              </div>
              
              {/* Run comparison button - 12px padding from containers, right justified */}
              <div className="flex justify-end" style={{marginTop: '12px'}}>
                <button 
                  onClick={handleRunComparison}
                  disabled={isLoading}
                  className="px-6 py-3 text-sm font-medium transition-colors bg-[var(--primary-dark)] text-[#212327] rounded hover:bg-[#0AFB84] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Running...' : 'Run comparison'}
                </button>
              </div>

              {/* Results area - Fixed container, not scrollable */}
              {results && (
                <div className="mt-6 p-4 rounded-sm border" style={{backgroundColor: '#1B1D21', borderColor: '#454446'}}>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium text-white">
                      {results.startsWith('Error:') ? 'Error' : 'Comparison Results'}
                    </h3>
                    {!results.startsWith('Error:') && (
                      <button 
                        onClick={() => setShowModal(true)}
                        className="text-gray-400 hover:text-white transition-colors"
                        title="View in modal"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className={`text-sm ${
                    results.startsWith('Error:') 
                      ? 'text-red-300 bg-red-900/20 border border-red-500/30 p-3 rounded' 
                      : 'text-gray-300'
                  }`}>
                    <pre className="whitespace-pre-wrap font-sans">{results}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Right Container - Fixed, Full Height, Stacked above on mobile */}
          <div className="lg:col-span-8 order-1 lg:order-2 h-full">
            <div className="h-full w-full flex flex-col" style={{backgroundColor: '#1B1D21'}}>
              {/* Top Container - 50% height */}
              <div className="h-1/2 w-full">
                <LinkedComparisonChart />
              </div>
              {/* Bottom Container - 50% height with 6:12 responsive layout */}
              <div className="h-1/2 w-full flex gap-4 p-4">
                {/* Left Chart - 6 columns */}
                <div className="w-1/2 h-full">
                  <ConsistencyAnalysisChart />
                </div>
                {/* Right Chart - Skill Comparison */}
                <div className="w-1/2 h-full">
                  <SkillComparisonChart />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Overlay - Only when modal is open */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="absolute top-0 left-0 bg-[#212327] shadow-xl overflow-hidden" style={{
            marginLeft: '20px', 
            marginTop: '64px', 
            width: 'calc(33.333% - 40px)', 
            height: 'calc(100vh - 64px)',
            maxWidth: 'calc(33.333% - 40px)'
          }}>
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-600">
              <h2 className="text-xl font-bold text-white">Comparison Results</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-4 overflow-y-auto" style={{height: 'calc(100vh - 120px)'}}>
              <div className="text-gray-300 text-sm">
                <pre className="whitespace-pre-wrap font-sans">{results}</pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 