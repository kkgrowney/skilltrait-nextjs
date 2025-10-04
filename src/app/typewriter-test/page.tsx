'use client';

import GradientTypewriterText from '@/components/GradientTypewriterText';

export default function TypewriterTest() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center space-y-12">
        <h1 className="text-4xl font-bold mb-8 text-white">
          Four-Line Typewriter Test
        </h1>
        
        <div className="space-y-12">
          {/* Exact replica of the original layout */}
          <div className="bg-[#1A1A1A] rounded-lg p-8 border border-gray-800">
            <h2 className="text-2xl font-semibold mb-6 text-[#00DF71]">
              Original Static Version (4 lines):
            </h2>
            <div className="w-layout-grid header1_component" style={{paddingBottom: '48px'}}>
              <div className="header1_content" style={{paddingTop: '24px'}}>
                <div className="margin-bottom margin-small">
                  <h1 className="heading-style-h1-2 gradient">
                    The Validated Talent Marketplace
                  </h1>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#1A1A1A] rounded-lg p-8 border border-gray-800">
            <h2 className="text-2xl font-semibold mb-6 text-[#00DF71]">
              Typewriter Version (4 lines):
            </h2>
            <div className="w-layout-grid header1_component" style={{paddingBottom: '48px'}}>
              <div className="header1_content" style={{paddingTop: '24px'}}>
                <div className="margin-bottom margin-small">
                  <GradientTypewriterText 
                    text="The Validated Talent Marketplace"
                    speed={100}
                    delay={1000}
                    textAlign="left"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Side by side comparison */}
          <div className="bg-[#1A1A1A] rounded-lg p-8 border border-gray-800">
            <h2 className="text-2xl font-semibold mb-6 text-[#00DF71]">
              Side by Side Comparison:
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-gray-400 mb-4">Static (Original)</p>
                <div className="w-layout-grid header1_component">
                  <div className="header1_content">
                    <div className="margin-bottom margin-small">
                      <h1 className="heading-style-h1-2 gradient">
                        The Validated Talent Marketplace
                      </h1>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-gray-400 mb-4">Typewriter (Animated)</p>
                <div className="w-layout-grid header1_component">
                  <div className="header1_content">
                    <div className="margin-bottom margin-small">
                      <GradientTypewriterText 
                        text="The Validated Talent Marketplace"
                        speed={100}
                        delay={2000}
                        textAlign="left"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Test with exact same container constraints */}
          <div className="bg-[#1A1A1A] rounded-lg p-8 border border-gray-800">
            <h2 className="text-2xl font-semibold mb-6 text-[#00DF71]">
              Exact Container Match (recreating original layout):
            </h2>
            <div className="max-width-large mx-auto">
              <div className="margin-bottom margin-small">
                <h1 className="heading-style-h1-2 gradient">
                  The Validated Talent Marketplace
                </h1>
              </div>
              <p className="text-size-medium-3 text-gray-300">
                A validated talent marketplace that transforms accomplishments, skills, and motivation into trusted matches for projects, roles, and growth.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
