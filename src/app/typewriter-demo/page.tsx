'use client';

import { useState } from 'react';
import TypewriterText from '@/components/TypewriterText';

export default function TypewriterDemo() {
  const [isPlaying, setIsPlaying] = useState(false);

  const demoTexts = [
    "Welcome to SkillTrait",
    "Build your professional reputation",
    "Showcase your achievements",
    "Connect with your team",
    "Grow your career"
  ];

  const handleStartDemo = () => {
    setIsPlaying(true);
  };

  const handleComplete = () => {
    console.log('Typewriter animation completed!');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center space-y-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-8">
          Typewriter Animation Demo
        </h1>
        
        <div className="space-y-8">
          {/* Basic example */}
          <div className="bg-[#1A1A1A] rounded-lg p-8 border border-gray-800">
            <h2 className="text-2xl font-semibold mb-4 text-[#00DF71]">
              Basic Typewriter Effect
            </h2>
            <div className="text-3xl font-mono min-h-[3rem] flex items-center justify-center">
              <TypewriterText 
                text="Hello, World!"
                speed={100}
                onComplete={handleComplete}
              />
            </div>
          </div>

          {/* Speed variations */}
          <div className="bg-[#1A1A1A] rounded-lg p-8 border border-gray-800">
            <h2 className="text-2xl font-semibold mb-4 text-[#00DF71]">
              Speed Variations
            </h2>
            <div className="space-y-4">
              <div className="text-xl">
                <span className="text-gray-400">Fast: </span>
                <TypewriterText 
                  text="Lightning fast typing!"
                  speed={30}
                />
              </div>
              <div className="text-xl">
                <span className="text-gray-400">Normal: </span>
                <TypewriterText 
                  text="Normal typing speed"
                  speed={100}
                />
              </div>
              <div className="text-xl">
                <span className="text-gray-400">Slow: </span>
                <TypewriterText 
                  text="Slow and deliberate"
                  speed={200}
                />
              </div>
            </div>
          </div>

          {/* Custom cursor */}
          <div className="bg-[#1A1A1A] rounded-lg p-8 border border-gray-800">
            <h2 className="text-2xl font-semibold mb-4 text-[#00DF71]">
              Custom Cursor Characters
            </h2>
            <div className="space-y-4">
              <div className="text-xl">
                <span className="text-gray-400">Default: </span>
                <TypewriterText 
                  text="Default cursor |"
                  speed={80}
                />
              </div>
              <div className="text-xl">
                <span className="text-gray-400">Underscore: </span>
                <TypewriterText 
                  text="Underscore cursor _"
                  speed={80}
                  cursorChar="_"
                />
              </div>
              <div className="text-xl">
                <span className="text-gray-400">Block: </span>
                <TypewriterText 
                  text="Block cursor █"
                  speed={80}
                  cursorChar="█"
                />
              </div>
            </div>
          </div>

          {/* Sequential animations */}
          <div className="bg-[#1A1A1A] rounded-lg p-8 border border-gray-800">
            <h2 className="text-2xl font-semibold mb-4 text-[#00DF71]">
              Sequential Text Animation
            </h2>
            <div className="text-2xl font-mono min-h-[8rem] flex flex-col items-center justify-center space-y-2">
              {demoTexts.map((text, index) => (
                <TypewriterText 
                  key={index}
                  text={text}
                  speed={80}
                  delay={index * 2000}
                  className="text-center"
                />
              ))}
            </div>
            <button
              onClick={handleStartDemo}
              className="mt-4 px-6 py-2 bg-[#00DF71] text-[#0A0A0A] font-semibold rounded-lg hover:bg-[#0AFB84] transition-colors"
            >
              Restart Demo
            </button>
          </div>

          {/* No cursor example */}
          <div className="bg-[#1A1A1A] rounded-lg p-8 border border-gray-800">
            <h2 className="text-2xl font-semibold mb-4 text-[#00DF71]">
              Without Cursor
            </h2>
            <div className="text-2xl">
              <TypewriterText 
                text="Clean text reveal without cursor"
                speed={60}
                showCursor={false}
              />
            </div>
          </div>
        </div>

        <div className="mt-12 text-gray-400">
          <p>This typewriter effect reveals text letter by letter from left to right,</p>
          <p>similar to the animation you saw on premiumlinkinbio.com</p>
        </div>
      </div>
    </div>
  );
}
