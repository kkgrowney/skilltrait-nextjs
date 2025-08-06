"use client";

import { useState } from "react";

export default function HomeSimple() {
  const [clickCount, setClickCount] = useState(0);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#1A1D21" }}>
      {/* Header */}
      <div
        className="w-full bg-[#1e2327] flex items-center justify-between border-b border-[#454446] h-16"
        style={{
          height: "64px !important",
          minHeight: "64px",
          maxHeight: "64px",
          paddingLeft: "32px",
          paddingRight: "32px",
        }}
      >
        {/* Title text */}
        <div className="font-semibold text-[#ffffff] text-[18px] whitespace-nowrap md:ml-0 ml-9 flex items-center">
          Home (Simple)
        </div>
        
        {/* Test Button */}
        <button
          onClick={() => {
            console.log("Test button clicked!");
            setClickCount(prev => prev + 1);
            alert("Test button works! Click count: " + (clickCount + 1));
          }}
          className="px-4 py-2 text-sm font-medium transition-colors bg-blue-600 text-white rounded hover:bg-blue-500"
        >
          TEST BUTTON
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-4xl">
          <h1 className="text-white text-2xl mb-4">Simple Home Page</h1>
          <p className="text-gray-300 mb-4">This is a simplified version without authentication context.</p>
          <p className="text-gray-300">Click count: {clickCount}</p>
          
          <button
            onClick={() => {
              console.log("Content button clicked!");
              alert("Content button works!");
            }}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500"
          >
            CONTENT BUTTON
          </button>
        </div>
      </div>
    </div>
  );
} 