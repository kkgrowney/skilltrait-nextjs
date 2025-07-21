'use client';

import { useState } from 'react';

export default function DigitalAwardsPage() {
  const [awardType, setAwardType] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [achievement, setAchievement] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAward, setGeneratedAward] = useState('');

  const handleGenerateAward = async () => {
    if (!awardType.trim() || !recipientName.trim() || !achievement.trim()) {
      setGeneratedAward('Please fill in all fields to generate an award.');
      return;
    }

    setIsGenerating(true);
    setGeneratedAward('');

    // Simulate award generation
    setTimeout(() => {
      const award = `
🏆 DIGITAL AWARD CERTIFICATE 🏆

This is to certify that

${recipientName}

has been awarded the

${awardType}

for outstanding achievement in

${achievement}

Date: ${new Date().toLocaleDateString()}
Certificate ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}

This digital award recognizes excellence and dedication in professional development.
      `;
      
      setGeneratedAward(award);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen" style={{backgroundColor: '#1B1D21'}}>
      {/* Main Content with Fixed Nav Offset */}
      <div className="pt-16 h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 h-full">
          {/* Left Container - Scrollable, Full Height */}
          <div className="lg:col-span-6 order-2 lg:order-1 h-full overflow-y-auto">
            <div className="h-full" style={{backgroundColor: '#212327', padding: '20px'}}>
              <div className="text-center mb-8">
                <h1 className="text-[30px] font-bold text-white mb-4">
                  Digital Awards Generator
                </h1>
                <p className="text-md text-gray-300 mb-6">
                  Create professional digital awards and certificates to recognize achievements and milestones.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 rounded-sm border" style={{backgroundColor: '#1B1D21', borderColor: '#454446'}}>
                  <h3 className="text-lg font-medium text-white mb-2">Award Type *</h3>
                  <input 
                    type="text"
                    placeholder="e.g., Employee of the Month, Project Excellence, Innovation Award"
                    value={awardType}
                    onChange={(e) => setAwardType(e.target.value)}
                    className="w-full px-4 py-2 text-sm bg-[#1B1D21] border rounded text-white placeholder-gray-400 focus:outline-none focus:border-[var(--primary-dark)]"
                    style={{borderColor: '#454446'}}
                  />
                  <p className="text-gray-300 text-sm mt-2">Enter the type of award or certificate you want to create.</p>
                </div>
                
                <div className="p-4 rounded-sm border" style={{backgroundColor: '#1B1D21', borderColor: '#454446'}}>
                  <h3 className="text-lg font-medium text-white mb-2">Recipient Name *</h3>
                  <input 
                    type="text"
                    placeholder="Enter the recipient's full name"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full px-4 py-2 text-sm bg-[#1B1D21] border rounded text-white placeholder-gray-400 focus:outline-none focus:border-[var(--primary-dark)]"
                    style={{borderColor: '#454446'}}
                  />
                  <p className="text-gray-300 text-sm mt-2">The name of the person receiving the award.</p>
                </div>
                
                <div className="p-4 rounded-sm border" style={{backgroundColor: '#1B1D21', borderColor: '#454446'}}>
                  <h3 className="text-lg font-medium text-white mb-2">Achievement Description *</h3>
                  <textarea 
                    placeholder="Describe the achievement, milestone, or contribution being recognized..."
                    value={achievement}
                    onChange={(e) => setAchievement(e.target.value)}
                    className="w-full px-4 py-2 text-sm bg-[#1B1D21] border rounded text-white placeholder-gray-400 focus:outline-none focus:border-[var(--primary-dark)] resize-none"
                    rows={4}
                    style={{borderColor: '#454446'}}
                  />
                  <p className="text-gray-300 text-sm mt-2">Provide details about what the award is recognizing.</p>
                </div>
              </div>
              
              {/* Generate button */}
              <div className="flex justify-end" style={{marginTop: '12px'}}>
                <button 
                  onClick={handleGenerateAward}
                  disabled={isGenerating}
                  className="px-6 py-3 text-sm font-medium transition-colors bg-[var(--primary-dark)] text-[#212327] rounded hover:bg-[#0AFB84] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? 'Generating...' : 'Generate Award'}
                </button>
              </div>

              {/* Generated Award Display */}
              {generatedAward && (
                <div className="mt-6 p-4 rounded-sm border" style={{backgroundColor: '#1B1D21', borderColor: '#454446'}}>
                  <h3 className="text-lg font-medium text-white mb-3">Generated Award</h3>
                  <div className="bg-[#212327] p-4 rounded border" style={{borderColor: '#454446'}}>
                    <pre className="text-gray-300 text-sm whitespace-pre-wrap font-sans">{generatedAward}</pre>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button 
                      onClick={() => navigator.clipboard.writeText(generatedAward)}
                      className="px-4 py-2 text-sm font-medium transition-colors bg-gray-600 text-white rounded hover:bg-gray-500"
                    >
                      Copy to Clipboard
                    </button>
                    <button 
                      onClick={() => setGeneratedAward('')}
                      className="px-4 py-2 text-sm font-medium transition-colors bg-gray-600 text-white rounded hover:bg-gray-500"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Right Container - Preview Area */}
          <div className="lg:col-span-6 order-1 lg:order-2 h-full">
            <div className="h-full w-full flex flex-col" style={{backgroundColor: '#1B1D21'}}>
              <div className="h-full w-full flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="text-6xl mb-4">🏆</div>
                  <h2 className="text-2xl font-bold text-white mb-4">Digital Awards</h2>
                  <p className="text-gray-300 text-lg">
                    Create professional digital awards and certificates
                  </p>
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded border" style={{backgroundColor: '#212327', borderColor: '#454446'}}>
                      <div className="text-3xl mb-2">👨‍💼</div>
                      <h3 className="text-white font-medium">Employee Recognition</h3>
                      <p className="text-gray-400 text-sm">Award outstanding employees</p>
                    </div>
                    <div className="p-4 rounded border" style={{backgroundColor: '#212327', borderColor: '#454446'}}>
                      <div className="text-3xl mb-2">🎯</div>
                      <h3 className="text-white font-medium">Project Milestones</h3>
                      <p className="text-gray-400 text-sm">Celebrate project achievements</p>
                    </div>
                    <div className="p-4 rounded border" style={{backgroundColor: '#212327', borderColor: '#454446'}}>
                      <div className="text-3xl mb-2">🚀</div>
                      <h3 className="text-white font-medium">Innovation Awards</h3>
                      <p className="text-gray-400 text-sm">Recognize creative solutions</p>
                    </div>
                    <div className="p-4 rounded border" style={{backgroundColor: '#212327', borderColor: '#454446'}}>
                      <div className="text-3xl mb-2">📈</div>
                      <h3 className="text-white font-medium">Performance Excellence</h3>
                      <p className="text-gray-400 text-sm">Award top performers</p>
                    </div>
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