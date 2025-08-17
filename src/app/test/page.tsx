"use client";

import { useState } from "react";

export default function TestPage() {
  const [clickCount, setClickCount] = useState(0);

  return (
    <div style={{ padding: '50px', backgroundColor: '#1A1D21', minHeight: '100vh', color: 'white' }}>
      <h1>Test Page</h1>
      <p>Click count: {clickCount}</p>
      
      <button 
        onClick={() => {
          console.log("Test button clicked!");
          setClickCount(prev => prev + 1);
          alert("Test button works! Click count: " + (clickCount + 1));
        }}
        style={{
          background: 'blue',
          color: 'white',
          padding: '15px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px',
          margin: '10px'
        }}
      >
        TEST BUTTON
      </button>
      
      <button 
        onClick={() => {
          console.log("Simple button clicked!");
          alert("Simple button works!");
        }}
        style={{
          background: 'red',
          color: 'white',
          padding: '15px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px',
          margin: '10px'
        }}
      >
        SIMPLE BUTTON
      </button>
      
      <div style={{ marginTop: '50px' }}>
        <h2>Debug Info:</h2>
        <p>Component rendered at: {new Date().toLocaleTimeString()}</p>
        <p>Click count: {clickCount}</p>
      </div>
    </div>
  );
} 