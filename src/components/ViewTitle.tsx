'use client';

import React from 'react';

interface ViewTitleProps {
  title: string;
}

export default function ViewTitle({ title }: ViewTitleProps) {
  return (
    <div className="bg-[#1e2327] h-16 absolute top-0 z-50 flex items-center" style={{ left: "64px", top: "64px", paddingLeft: "12px", width: "calc(100vw - 64px)" }}>
      {/* Bottom border */}
      <div className="absolute border-[#454446] border-b border-solid inset-0 pointer-events-none" />
      
      {/* Title text */}
      <div className="font-semibold text-[#ffffff] text-[18px] whitespace-nowrap">
        {title}
      </div>
    </div>
  );
} 