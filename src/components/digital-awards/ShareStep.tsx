"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { saveUserProp } from "@/lib/firebase";
import Link from "next/link";
import SignUpModal from "./SignupModal";

interface ShareStepProps {
  onPrevious: () => void;
  selectedTemplate?: any;
  companyNameText?: string;
  uploadedLogoFile?: File | null;
  backgroundNameText?: string;
  uploadedBackgroundFile?: File | null;
  propsTitle?: string;
  propsRecipients?: string[];
  fromName?: string;
  fromDate?: string;
  fromMessage?: string;
}

export default function ShareStep({ 
  onPrevious, 
  selectedTemplate,
  companyNameText,
  uploadedLogoFile,
  backgroundNameText,
  uploadedBackgroundFile,
  propsTitle,
  propsRecipients,
  fromName,
  fromDate,
  fromMessage
}: ShareStepProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAward, setGeneratedAward] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isSignupModalOpen, setisSignupModalOpen] = useState<boolean>(false);
  const [savedPropId, setSavedPropId] = useState<string | null>(null);

  const handleGenerateAward = async () => {
    setIsGenerating(true);

    try {
      // Get current user
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Generate the completed prop image
      const fullPropImage = await generateCompletedPropImage();

      // Create prop data object with the same structure as templates
      const propData = {
        achievement: {
          props: selectedTemplate?.achievement?.props || "",
          logoImage: selectedTemplate?.achievement?.logoImage || "",
          tags: selectedTemplate?.achievement?.tags || [],
        },
        // User customizations
        customizations: {
          companyName: companyNameText || "",
          uploadedLogoFile: uploadedLogoFile ? await fileToBase64(uploadedLogoFile) : null,
          backgroundName: backgroundNameText || "",
          uploadedBackgroundFile: uploadedBackgroundFile ? await fileToBase64(uploadedBackgroundFile) : null,
          propsTitle: propsTitle || "",
          propsRecipients: propsRecipients || [],
          fromName: fromName || "",
          fromDate: fromDate || "",
          fromMessage: fromMessage || "",
        },
        // Generated completed prop image
        fullPropImage: fullPropImage,
        // Template reference
        templateId: selectedTemplate?.id || "",
        templateType: "props"
      };

      // Save to Firestore
      const propId = await saveUserProp(user.uid, propData);
      setSavedPropId(propId);

      // Simulate award generation
      setTimeout(() => {
        const award = `
🏆 DIGITAL AWARD CERTIFICATE 🏆

This is to certify that

${fromName || "John Doe"}

has been awarded the

${propsTitle || "Employee of the Month"}

for outstanding achievement in

${fromMessage || "Excellence in customer service and team collaboration"}

Date: ${fromDate || new Date().toLocaleDateString()}
Certificate ID: ${propId}

This digital award recognizes excellence and dedication in professional development.
        `;

        setGeneratedAward(award);
        setIsGenerating(false);
      }, 2000);

    } catch (error) {
      console.error("Error generating award:", error);
      setIsGenerating(false);
      // Handle error appropriately
    }
  };

  // Function to generate completed prop image
  const generateCompletedPropImage = async (): Promise<string> => {
    try {
      // Prepare parameters for the cloud function
      const recipientArray = propsRecipients?.join(',') || 'Team Members';
      const message = fromMessage || 'Thank you for your outstanding work and dedication!';
      const sender = fromName || 'Management';
      const category = 'props';
      const template = selectedTemplate?.id || '';
      const teamId = 'default'; // You can customize this as needed
      
      // Determine company parameter
      let companyParam;
      if (uploadedLogoFile) {
        // If user uploaded a logo, use "other" and pass custom company name
        companyParam = 'other';
        const customCompany = companyNameText || 'Company Name';
        const imageUrl = `https://us-central1-skill-trait-rwubkx.cloudfunctions.net/imageGeneration?rec=${encodeURIComponent(recipientArray)}&message=${encodeURIComponent(message)}&sen=${encodeURIComponent(sender)}&com=${encodeURIComponent(customCompany)}&cat=${category}&tem=${template}&tid=${teamId}`;
        return imageUrl;
      } else {
        // If no logo uploaded, use the template's company
        companyParam = selectedTemplate?.achievement?.company || 'default';
        const imageUrl = `https://us-central1-skill-trait-rwubkx.cloudfunctions.net/imageGeneration?rec=${encodeURIComponent(recipientArray)}&message=${encodeURIComponent(message)}&sen=${encodeURIComponent(sender)}&com=${companyParam}&cat=${category}&tem=${template}&tid=${teamId}`;
        return imageUrl;
      }
    } catch (error) {
      console.error('Error generating image URL:', error);
      return '';
    }
  };

  // Helper function to convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
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
    const [email, setEmail] = useState("");
    const [emails, setEmails] = useState<string[]>([]);
    const [error, setError] = useState("");

    const handleAdd = () => {
      if (!email) return;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError("Invalid email");
        return;
      }
      if (emails.includes(email)) {
        setError("Email already added");
        return;
      }
      setEmails([...emails, email]);
      setEmail("");
      setError("");
    };

    const handleRemove = (removeEmail: string) => {
      setEmails(emails.filter((e) => e !== removeEmail));
    };

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setIsLoggedIn(!!user);
      });

      return () => unsubscribe();
    }, []);

    return (
      <div className="mt-6">
        <h3 className="text-lg font-medium text-white mb-2">
          Email Recipients
        </h3>
        <div className="flex gap-2 mb-2">
          <input
            type="email"
            disabled={!isLoggedIn}
            placeholder="Enter one email at a time"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-3 py-2 rounded bg-[#1B1D21] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-[var(--primary-dark)] disabled:opacity-50"
            style={{ fontFamily: "Poppins", fontSize: "14px" }}
          />
          <button
            type="button"
            disabled={!isLoggedIn}
            onClick={handleAdd}
            className="bg-white text-black px-4 py-2 rounded font-semibold hover:bg-gray-200 disabled:opacity-50"
          >
            Add
          </button>
        </div>
        {error && <div className="text-red-400 text-xs mb-2">{error}</div>}
        <div className="flex flex-wrap gap-2">
          {emails.map((e) => (
            <span
              key={e}
              className="flex items-center bg-gray-700 text-white px-3 py-1 rounded-full text-sm"
            >
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

        <h3 className="text-lg font-medium text-white mb-2 mt-6">
          Share Props
        </h3>

        {/* Social Media Icons */}
        <div className="flex flex-wrap justify-center gap-3 mb-4 sm:gap-4 md:gap-5">
          {[
            {
              label: "Copy",
              bg: "bg-gray-600 hover:bg-gray-500",
              icon: (
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-1 16H8V7h10v14z" />
              ),
            },
            {
              label: "Link",
              bg: "bg-gray-600 hover:bg-gray-500",
              icon: (
                <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
              ),
            },
            {
              label: "Download",
              bg: "bg-gray-600 hover:bg-gray-500",
              icon: <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />,
            },
            {
              label: "Share on LinkedIn",
              bg: "bg-[#0077B5] hover:bg-[#005885]",
              icon: (
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              ),
            },
            {
              label: "Share on Twitter",
              bg: "bg-black hover:bg-gray-800",
              icon: (
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              ),
            },
            {
              label: "Share on Facebook",
              bg: "bg-[#1877F2] hover:bg-[#166FE5]",
              icon: (
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              ),
            },
          ].map(({ label, bg, icon }, idx) => (
            <button
              key={idx}
              type="button"
              disabled={!isLoggedIn}
              className={`disabled:opacity-50 p-3 sm:p-2 md:p-3 rounded-full ${bg} transition-colors flex items-center justify-center`}
              aria-label={label}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-white"
              >
                {icon}
              </svg>
            </button>
          ))}
        </div>

        {!isLoggedIn && (
          <Link href="/signin" className="font-bold text-[var(--primary-dark)]">
            Please Login To Share Props And Email Receipents
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="text-center">
        <h1 className="text-[30px] font-bold text-white mb-4">Share</h1>
      </div>

      <SignUpModal
        isOpen={isSignupModalOpen}
        setIsOpen={setisSignupModalOpen}
      />

      <div className="space-y-4 flex-1">
        {!generatedAward ? (
          <div
            className="p-4 rounded-sm border"
            style={{ backgroundColor: "#1B1D21", borderColor: "#454446" }}
          >
            <h3 className="text-lg font-medium text-white mb-2">
              Generate, Save and Share
            </h3>
            <p className="text-gray-300 text-sm mb-2">
              Click the button below to generate your digital award based on all
              the information you&#39;ve provided.
            </p>
            <button
              className="w-full bg-[var(--primary-dark)] text-white font-semibold py-2 rounded mb-4 mt-2 hover:bg-[var(--primary)] transition"
              onClick={
                !isLoggedIn
                  ? () => setisSignupModalOpen(true)
                  : handleGenerateAward
              }
              disabled={isGenerating}
            >
              {isGenerating ? "Generating..." : "Generate & Save"}
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
              {savedPropId && (
                <div className="text-green-400 text-sm mb-2">
                  ✓ Award saved successfully! ID: {savedPropId}
                </div>
              )}
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
