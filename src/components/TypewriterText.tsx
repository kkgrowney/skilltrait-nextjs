'use client';

import { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number; // milliseconds per character
  delay?: number; // delay before starting animation
  className?: string;
  showCursor?: boolean;
  cursorChar?: string;
  onComplete?: () => void;
}

export default function TypewriterText({
  text,
  speed = 50,
  delay = 0,
  className = '',
  showCursor = true,
  cursorChar = '|',
  onComplete
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (currentIndex === text.length && !isComplete) {
      setIsComplete(true);
      onComplete?.();
    }
  }, [currentIndex, text, speed, isComplete, onComplete]);

  // Reset when text changes
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
    setIsComplete(false);
  }, [text]);

  return (
    <span className={className}>
      {displayedText}
      {showCursor && (
        <span className="typewriter-cursor animate-blink">
          {cursorChar}
        </span>
      )}
    </span>
  );
}
