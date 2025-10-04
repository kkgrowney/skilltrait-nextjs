'use client';

import { useState, useEffect } from 'react';

interface GradientTypewriterTextProps {
  text: string;
  speed?: number; // milliseconds per character
  delay?: number; // delay before starting animation
  className?: string;
  showCursor?: boolean;
  cursorChar?: string;
  onComplete?: () => void;
  direction?: 'left-to-right' | 'right-to-left'; // Animation direction
  textAlign?: 'left' | 'center' | 'right'; // Text alignment
}

export default function GradientTypewriterText({
  text,
  speed = 100,
  delay = 0,
  className = '',
  showCursor = true,
  cursorChar = '|',
  onComplete,
  direction = 'left-to-right',
  textAlign = 'left'
}: GradientTypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setIsStarted(true);
    }, delay);

    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (isStarted && currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (isStarted && currentIndex === text.length && !isComplete) {
      setIsComplete(true);
      onComplete?.();
    }
  }, [isStarted, currentIndex, text, speed, isComplete, onComplete]);

  // Reset when text changes
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
    setIsComplete(false);
    setIsStarted(false);
  }, [text]);

  const textAlignClass = textAlign === 'center' ? 'text-center' : 
                        textAlign === 'right' ? 'text-right' : 'text-left';

  return (
    <h1 className={`heading-style-h1-2 gradient ${textAlignClass} ${className}`}>
      {displayedText}
      {showCursor && isStarted && (
        <span className="typewriter-cursor animate-blink">
          {cursorChar}
        </span>
      )}
    </h1>
  );
}
