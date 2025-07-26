"use client";

import { useState } from "react";

interface ShareStepProps {
  onPrevious: () => void;
}

export default function ShareStep({ onPrevious }: ShareStepProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAward, setGeneratedAward] = useState("");

  const handleGenerateAward = async () => {
    setIsGenerating(true);

    // Simulate award generation
    setTimeout(() => {
      const award = `
🏆 DIGITAL AWARD CERTIFICATE 🏆

This is to certify that

John Doe

has been awarded the

Employee of the Month

for outstanding achievement in

Excellence in customer service and team collaboration

Date: ${new Date().toLocaleDateString()}
Certificate ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}

This digital award recognizes excellence and dedication in professional development.
      `;

      setGeneratedAward(award);
      setIsGenerating(false);
    }, 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedAward], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "digital-award.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Digital Award",
        text: generatedAward,
      });
    } else {
      navigator.clipboard.writeText(generatedAward);
      alert("Award copied to clipboard!");
    }
  };

  // EmailRecipients component
  function EmailRecipients() {
    const [email, setEmail] = useState('');
    const [emails, setEmails] = useState<string[]>([]);
    const [error, setError] = useState('');

    const handleAdd = () => {
      if (!email) return;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Invalid email');
        return;
      }
      if (emails.includes(email)) {
        setError('Email already added');
        return;
      }
      setEmails([...emails, email]);
      setEmail('');
      setError('');
    };

    const handleRemove = (removeEmail: string) => {
      setEmails(emails.filter(e => e !== removeEmail));
    };

    return (
      <div className="mt-6">
        <h3 className="text-lg font-medium text-white mb-2">Email Recipients</h3>
        <div className="flex gap-2 mb-2">
          <input
            type="email"
            placeholder="Enter one email at a time"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="flex-1 px-3 py-2 rounded bg-[#1B1D21] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-[var(--primary-dark)]"
            style={{ fontFamily: 'Poppins', fontSize: '14px' }}
          />
          <button
            type="button"
            onClick={handleAdd}
            className="bg-white text-black px-4 py-2 rounded font-semibold hover:bg-gray-200"
          >
            Add
          </button>
        </div>
        {error && <div className="text-red-400 text-xs mb-2">{error}</div>}
        <div className="flex flex-wrap gap-2">
          {emails.map(e => (
            <span key={e} className="flex items-center bg-gray-700 text-white px-3 py-1 rounded-full text-sm">
              {e}
              <button
                type="button"
                onClick={() => handleRemove(e)}
                className="ml-2 text-gray-300 hover:text-red-400 focus:outline-none"
                aria-label={`Remove ${e}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        
        <h3 className="text-lg font-medium text-white mb-2 mt-6">Share Props</h3>
        
        {/* Social Media Icons */}
        <div className="flex justify-center gap-6 mb-4">
          {/* Copy Icon */}
          <button
            type="button"
            className="p-3 rounded-full bg-gray-600 hover:bg-gray-500 transition-colors"
            aria-label="Copy"
          >
            <img src="/copy.png" alt="Copy" width="26" height="26" />
          </button>
          
          {/* Link Icon */}
          <button
            type="button"
            className="p-3 rounded-full bg-gray-600 hover:bg-gray-500 transition-colors"
            aria-label="Link"
          >
            <img src="/link.png" alt="Link" width="26" height="26" />
          </button>
          
          {/* Download Icon */}
          <button
            type="button"
            className="p-3 rounded-full bg-gray-600 hover:bg-gray-500 transition-colors"
            aria-label="Download"
          >
            <img src="/download.png" alt="Download" width="26" height="26" />
          </button>
          
          {/* LinkedIn Icon */}
          <button
            type="button"
            className="p-3 rounded-full bg-[#0077B5] hover:bg-[#005885] transition-colors"
            aria-label="Share on LinkedIn"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </button>
          
          {/* Twitter/X Icon */}
          <button
            type="button"
            className="p-3 rounded-full bg-black hover:bg-gray-800 transition-colors"
            aria-label="Share on Twitter"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </button>
          
          {/* Facebook Icon */}
          <button
            type="button"
            className="p-3 rounded-full bg-[#1877F2] hover:bg-[#166FE5] transition-colors"
            aria-label="Share on Facebook"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="text-center mb-8">
        <h1 className="text-[30px] font-bold text-white mb-4">Share</h1>
        <p className="text-md text-gray-300 mb-3">
          Generate and share your digital award.
        </p>
      </div>

      <div className="space-y-4 flex-1">
        {!generatedAward ? (
          <div
            className="p-4 rounded-sm border"
            style={{ backgroundColor: "#1B1D21", borderColor: "#454446" }}
          >
            <h3 className="text-lg font-medium text-white mb-2">
              Ready to Generate
            </h3>
            <p className="text-gray-300 text-sm mb-2">
              Click the button below to generate your digital award based on all
              the information you&#39;ve provided.
            </p>
            <button
              className="w-full bg-[var(--primary-dark)] text-white font-semibold py-2 rounded mb-4 mt-2 hover:bg-[var(--primary)] transition"
              onClick={handleGenerateAward}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate Award'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div
              className="p-4 rounded-sm border"
              style={{ backgroundColor: "#1B1D21", borderColor: "#454446" }}
            >
              <h3 className="text-lg font-medium text-white mb-3">
                Generated Award
              </h3>
              <div
                className="bg-[#212327] p-4 rounded border"
                style={{ borderColor: "#454446" }}
              >
                <pre className="text-gray-300 text-sm whitespace-pre-wrap font-sans">
                  {generatedAward}
                </pre>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleDownload}
                className="flex-1 px-4 py-2 text-sm font-medium transition-colors bg-gray-600 text-white rounded hover:bg-gray-500"
              >
                Download
              </button>
              <button
                onClick={handleShare}
                className="flex-1 px-4 py-2 text-sm font-medium transition-colors bg-[var(--primary-dark)] text-[#212327] rounded hover:bg-[#0AFB84]"
              >
                Share
              </button>
            </div>
          </div>
        )}
        {/* Email Recipients component as a separate section below */}
        <EmailRecipients />
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between" style={{ marginTop: "12px" }}>
        <button
          onClick={onPrevious}
          className="px-6 py-3 text-sm font-medium transition-colors bg-gray-600 text-white rounded hover:bg-gray-500"
        >
          Previous
        </button>
      </div>
    </div>
  );
}
