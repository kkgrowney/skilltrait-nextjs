'use client';

import { useState } from 'react';
import NavPrelogin from '@/components/nav_prelogin';

export default function LICVCheckerPage() {
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<string>('');
  const [showModal, setShowModal] = useState(false);

  const handleRunComparison = async () => {
    if (!linkedinUrl || !resumeText.trim()) {
      alert('Please enter a LinkedIn URL and paste your resume text');
      return;
    }

    setIsLoading(true);
    setResults('');

    try {
      const formData = new FormData();
      formData.append('linkedinUrl', linkedinUrl);
      formData.append('resumeText', resumeText);

      const response = await fetch('/api/compare-licv', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.result);
      } else {
        throw new Error('Failed to run comparison');
      }
    } catch (error) {
      console.error('Error running comparison:', error);
      setResults('Error running comparison. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{backgroundColor: '#1B1D21'}}>
      {/* Fixed Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <NavPrelogin />
      </div>
      
      {/* Main Content with Fixed Nav Offset */}
      <div className="pt-16 h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 h-full">
          {/* Left Container - Scrollable, Full Height */}
          <div className="lg:col-span-4 order-2 lg:order-1 h-full overflow-y-auto">
            <div className="h-full" style={{backgroundColor: '#212327', padding: '20px'}}>
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-white mb-4">
                  LICV Checker
                </h1>
                <p className="text-lg text-gray-300">
                  Run a comparison check of a LinkedIn profile and resume to verify consistency and review expertise in skills.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 rounded-sm border" style={{backgroundColor: '#1B1D21', borderColor: '#454446'}}>
                  <h3 className="text-lg font-medium text-white mb-2">LinkedIn profile</h3>
                  <input 
                    type="text" 
                    placeholder="Enter LinkedIn profile URL"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    className="w-full px-4 py-2 text-sm bg-[#1B1D21] border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-[var(--primary-dark)]"
                  />
                </div>
                <div className="p-4 rounded-sm border" style={{backgroundColor: '#1B1D21', borderColor: '#454446'}}>
                  <h3 className="text-lg font-medium text-white mb-2">Paste resume</h3>
                  <textarea 
                    placeholder="Paste your resume text here..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    className="w-full px-4 py-2 text-sm bg-[#1B1D21] border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-[var(--primary-dark)] resize-none"
                    rows={8}
                    style={{minHeight: '200px', maxHeight: '300px'}}
                  />
                  <p className="text-gray-300 text-sm mt-2">Paste your resume content to verify consistency with your LinkedIn profile.</p>
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
                    <h3 className="text-lg font-medium text-white">Comparison Results</h3>
                    <button 
                      onClick={() => setShowModal(true)}
                      className="text-gray-400 hover:text-white transition-colors"
                      title="View in modal"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                  </div>
                  <div className="text-gray-300 text-sm">
                    <pre className="whitespace-pre-wrap font-sans">{results}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Right Container - Fixed, Full Height, Stacked above on mobile */}
          <div className="lg:col-span-8 order-1 lg:order-2 h-full">
            <div className="h-full bg-center bg-cover bg-no-repeat" style={{backgroundImage: 'url(\'/LICV-visual.png\')', minHeight: '300px'}}>
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