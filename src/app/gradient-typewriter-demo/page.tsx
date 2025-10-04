'use client';

import { useState } from 'react';
import GradientTypewriterText from '@/components/GradientTypewriterText';

export default function GradientTypewriterDemo() {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleStartDemo = () => {
    setIsPlaying(true);
  };

  const handleComplete = () => {
    console.log('Gradient typewriter animation completed!');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-8">
      <div className="max-w-6xl mx-auto text-center space-y-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-8 text-white">
          Gradient Typewriter Demo
        </h1>
        
        <div className="space-y-8">
          {/* Main demo - exactly like the original */}
          <div className="bg-[#1A1A1A] rounded-lg p-12 border border-gray-800">
            <h2 className="text-2xl font-semibold mb-8 text-[#00DF71]">
              "The Validated Talent Marketplace" with Gradient
            </h2>
            <div className="min-h-[8rem] flex items-center justify-center">
              <GradientTypewriterText 
                text="The Validated Talent Marketplace"
                speed={100}
                delay={500}
                onComplete={handleComplete}
              />
            </div>
            <button
              onClick={handleStartDemo}
              className="mt-8 px-6 py-3 bg-[#00DF71] text-[#0A0A0A] font-semibold rounded-lg hover:bg-[#0AFB84] transition-colors"
            >
              Restart Animation
            </button>
          </div>

          {/* Comparison with original styling */}
          <div className="bg-[#1A1A1A] rounded-lg p-8 border border-gray-800">
            <h2 className="text-2xl font-semibold mb-4 text-[#00DF71]">
              Comparison: Static vs Typewriter
            </h2>
            <div className="space-y-6">
              <div>
                <p className="text-gray-400 mb-2">Static (original):</p>
                <h1 className="heading-style-h1-2 gradient">
                  The Validated Talent Marketplace
                </h1>
              </div>
              <div>
                <p className="text-gray-400 mb-2">Typewriter (animated):</p>
                <GradientTypewriterText 
                  text="The Validated Talent Marketplace"
                  speed={80}
                  delay={1000}
                />
              </div>
            </div>
          </div>

          {/* Different speeds demo */}
          <div className="bg-[#1A1A1A] rounded-lg p-8 border border-gray-800">
            <h2 className="text-2xl font-semibold mb-4 text-[#00DF71]">
              Different Typing Speeds
            </h2>
            <div className="space-y-6">
              <div>
                <p className="text-gray-400 mb-2">Fast (50ms per character):</p>
                <GradientTypewriterText 
                  text="Fast typing speed"
                  speed={50}
                  delay={500}
                />
              </div>
              <div>
                <p className="text-gray-400 mb-2">Normal (100ms per character):</p>
                <GradientTypewriterText 
                  text="Normal typing speed"
                  speed={100}
                  delay={2000}
                />
              </div>
              <div>
                <p className="text-gray-400 mb-2">Slow (200ms per character):</p>
                <GradientTypewriterText 
                  text="Slow typing speed"
                  speed={200}
                  delay={3500}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-gray-400">
          <p>This maintains the exact same gradient styling and formatting as the original title,</p>
          <p>but reveals the text letter by letter with a blinking cursor.</p>
        </div>
      </div>
    </div>
  );
}
