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
