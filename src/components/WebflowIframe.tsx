'use client';

interface WebflowIframeProps {
  src: string;
  title: string;
}

export default function WebflowIframe({ src, title }: WebflowIframeProps) {
  return (
    <div className="w-full h-screen">
      <iframe 
        src={src}
        className="w-full h-full border-0"
        title={title}
      />
    </div>
  );
} 