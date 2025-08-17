'use client';

import { useState, useEffect, useRef } from 'react';
import { companyNames } from '@/lib/companyNames';

interface CompanyButtonOverlayProps {
  imageUrl: string;
  altText?: string;
  className?: string;
}

export default function CompanyButtonOverlay({ 
  imageUrl, 
  altText = "Company background", 
  className = "" 
}: CompanyButtonOverlayProps) {
  const [fontSize, setFontSize] = useState(14);
  const [companyName, setCompanyName] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Select a random company name
    const randomIndex = Math.floor(Math.random() * companyNames.length);
    setCompanyName(companyNames[randomIndex]);
  }, []);

  useEffect(() => {
    const updateFontSize = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const width = container.offsetWidth;
      const height = container.offsetHeight;
      
      // Calculate font size based on container dimensions
      // Base calculation: smaller containers get smaller fonts
      const baseSize = Math.min(width, height) / 50; // Adjust divisor for scaling
      const clampedSize = Math.max(10, Math.min(14, baseSize)); // Clamp between 10pt and 14pt
      
      setFontSize(clampedSize);
    };

    updateFontSize();
    
    // Add resize listener
    const resizeObserver = new ResizeObserver(updateFontSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`relative bg-white ${className}`}
      style={{ width: '100%', height: '100%' }}
    >
      {/* Background Image */}
      <div
        className="w-full h-full bg-center bg-cover bg-no-repeat"
        style={{ 
          backgroundImage: `url('${imageUrl}')`,
          aspectRatio: '600/400' // Match the container aspect ratio
        }}
      />
      
      {/* Button Overlay */}
      <div className="absolute inset-0 flex items-end justify-start pb-4" style={{ paddingLeft: '24px' }}>
        {/* Single Button */}
        <div
          className="bg-black border border-white rounded-full px-3 py-1 flex items-center justify-center"
          style={{ 
            fontSize: `${fontSize}px`,
            lineHeight: '1.5',
            minHeight: `${fontSize * 1.5 + 8}px`, // Dynamic height based on font size
            backgroundColor: 'rgba(0, 0, 0, 0.5)' // Black with 50% opacity
          }}
        >
          <span className="font-semibold text-white text-center whitespace-nowrap">
            {companyName}
          </span>
        </div>
      </div>
    </div>
  );
} 