'use client';

import { useEffect, useState } from 'react';

export default function AnimationTest() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    console.log('Component mounted, starting animation setup');
    
    const startAnimation = () => {
      console.log('Starting animation');
      setIsAnimating(true);
      
      // Simple reveal animation
      setTimeout(() => {
        setAnimationComplete(true);
        setIsAnimating(false);
      }, 3000);
    };

    // Start after 1 second
    const timer = setTimeout(startAnimation, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center space-y-12">
        <h1 className="text-4xl font-bold mb-8 text-white">
          Simple Animation Test
        </h1>
        
        <div className="bg-[#1A1A1A] rounded-lg p-8 border border-gray-800">
          <h2 className="text-2xl font-semibold mb-6 text-[#00DF71]">
            Test the Reveal Animation:
          </h2>
          
          {/* Simple test with CSS animation */}
          <div className="relative">
            <h1 
              className="text-6xl font-bold mb-4"
              style={{
                background: 'linear-gradient(91deg, #ecf4f0, #37fb9a 53%, #2ec9c2 70%, #7ecfcd)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textAlign: 'left',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              The Validated Talent Marketplace
              {isAnimating && !animationComplete && (
                <div 
                  className="absolute top-0 left-0 w-full h-full bg-[#0A0A0A] animate-reveal"
                  style={{
                    animation: 'reveal 3s ease-out forwards'
                  }}
                />
              )}
            </h1>
            
            {isAnimating && !animationComplete && (
              <div className="text-yellow-400 text-sm">
                Animation in progress... (3 seconds)
              </div>
            )}
            
            {animationComplete && (
              <div className="text-green-400 text-sm">
                Animation complete!
              </div>
            )}
          </div>
          
          <p className="text-gray-300 mt-4">
            A validated talent marketplace that transforms accomplishments, skills, and motivation into trusted matches for projects, roles, and growth.
          </p>
          
          <div className="mt-6">
            <button className="px-6 py-3 bg-[#00DF71] text-[#212327] rounded-lg font-medium">
              Awards Generator
            </button>
            <button className="px-6 py-3 border border-gray-400 text-white rounded-lg font-medium ml-4">
              Free Slack App
            </button>
          </div>
          
          <div className="mt-8">
            <p className="text-4xl font-bold text-gray-300">
              Get started
            </p>
          </div>
        </div>
        
        <div className="text-gray-400">
          <p>This should show the text revealing from left to right</p>
          <p>without moving the content below</p>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes reveal {
          0% {
            width: 100%;
          }
          100% {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
