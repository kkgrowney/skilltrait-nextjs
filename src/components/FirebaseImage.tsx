'use client';

import { useState, useEffect } from 'react';

interface FirebaseImageProps {
  templateNumber: number;
  fallbackSrc?: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export default function FirebaseImage({ 
  templateNumber, 
  fallbackSrc, 
  alt, 
  className, 
  style, 
  onClick 
}: FirebaseImageProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      try {
        setIsLoading(true);
        setError(false);
        // Use local placeholder image from public folder
        const localUrl = `/templates/props/props-${templateNumber}.png`;
        setImageUrl(localUrl);
      } catch (err) {
        console.error('Failed to load image:', err);
        setError(true);
        if (fallbackSrc) {
          setImageUrl(fallbackSrc);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
  }, [templateNumber, fallbackSrc]);

  if (isLoading) {
    return (
      <div 
        className={`bg-gray-200 animate-pulse ${className || ''}`}
        style={style}
      >
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      </div>
    );
  }

  if (error && !fallbackSrc) {
    return (
      <div 
        className={`bg-gray-100 flex items-center justify-center ${className || ''}`}
        style={style}
      >
        <div className="text-gray-500 text-sm">Image not available</div>
      </div>
    );
  }

  return (
    <img 
      src={imageUrl}
      alt={alt}
      className={className}
      style={style}
      onClick={onClick}
    />
  );
} 