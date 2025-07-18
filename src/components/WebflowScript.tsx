'use client';

import Script from 'next/script';

export default function WebflowScript() {
  return (
    <Script
      src="/skill-trait-webflow/js/webflow.js"
      strategy="afterInteractive"
    />
  );
} 