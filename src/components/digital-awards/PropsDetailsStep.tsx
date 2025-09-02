"use client";

import { useEffect, useState } from "react";

interface PropsDetailsStepProps {
  onNext: () => void;
  onPrevious: () => void;
  selectedTemplate?: string | null;
  templateType?: "props" | "achievements";
  propsTitle?: string;
  setPropsTitle?: (title: string) => void;
  propsRecipients?: string[];
  setPropsRecipients?: (recipients: string[]) => void;
  fromName?: string;
  setFromName?: (name: string) => void;
  fromDate?: string;
  setFromDate?: (date: string) => void;
  fromMessage?: string;
  setFromMessage?: (message: string) => void;
}

export default function PropsDetailsStep({
  onNext,
  onPrevious,
  selectedTemplate,
  templateType,
  propsTitle,
  setPropsTitle,
  propsRecipients,
  setPropsRecipients,
  fromName,
  setFromName,
  fromDate,
  setFromDate,
  fromMessage,
  setFromMessage,
}: PropsDetailsStepProps) {
  const [mounted, setMounted] = useState(false);
  
  const [title, setTitle] = useState(propsTitle || "");
  const [showTitleInput, setShowTitleInput] = useState(false);
  const [recipients, setRecipients] = useState<string[]>(propsRecipients || []);
  const [newRecipient, setNewRecipient] = useState("");
  const [name, setName] = useState(fromName || "");
  const [date, setDate] = useState(fromDate || "");
  const [message, setMessage] = useState(fromMessage || "");

  const handleAddRecipient = () => {
    if (newRecipient.trim() && !recipients.includes(newRecipient.trim())) {
      const updatedRecipients = [...recipients, newRecipient.trim()];
      setRecipients(updatedRecipients);
      if (setPropsRecipients) {
        setPropsRecipients(updatedRecipients);
      }
      setNewRecipient("");
    }
  };

  const handleRemoveRecipient = (index: number) => {
    const updatedRecipients = recipients.filter((_, i) => i !== index);
    setRecipients(updatedRecipients);
    if (setPropsRecipients) {
      setPropsRecipients(updatedRecipients);
    }
  };

  const handleNext = () => {
    // Validate that a date is selected
    if (!date) {
      alert("Please select a date before proceeding.");
      return;
    }
    
    if (setPropsTitle) setPropsTitle(title);
    if (setFromName) setFromName(name);
    if (setFromDate) setFromDate(date);
    if (setFromMessage) setFromMessage(message);
    onNext();
  };

  // Remove the useEffect that sets default date - user must choose a date
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="h-full flex flex-col" style={{ marginLeft: "8px", marginRight: "8px" }}>
      <div className="text-center mb-6 flex-shrink-0" style={{ marginTop: "24px" }}>
        <h1 className="text-[30px] font-bold text-white mb-1">Details</h1>
        <p className="text-md text-gray-300 mb-[-2]">
          Add details to personalize your props template.
        </p>
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto">
        {/* Props Title Section */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4">Props Title *</h3>
          <div
            className="p-4 rounded-sm border"
            style={{ backgroundColor: "#1B1D21", borderColor: "#454446" }}
          >
            {mounted && showTitleInput ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Enter props title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={22}
                  className="flex-1 px-4 py-2 text-sm bg-[#1B1D21] border rounded text-white placeholder-gray-400 focus:outline-none focus:border-[var(--primary-dark)]"
                  style={{
                    borderColor: "#454446",
                    fontFamily: "Poppins",
                    fontSize: "14px",
                    color: "white",
                    textAlign: "right",
                    paddingRight: "12px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                />
                <style jsx>{`
                  input::placeholder {
                    text-align: right;
                  }
                `}</style>
                <button
                  onClick={() => {
                    if (setPropsTitle) {
                      setPropsTitle(title);
                    }
                    setShowTitleInput(false);
                  }}
                  className="px-4 py-2 text-sm font-medium transition-colors bg-white text-[#212327] rounded hover:bg-gray-100"
                >
                  Add
                </button>
              </div>
            ) : (
              <div
                onClick={() => setShowTitleInput(true)}
                className="w-full px-4 py-2 text-sm bg-[#1B1D21] border rounded text-white placeholder-gray-400 cursor-pointer hover:border-[var(--primary-dark)] transition-colors"
                style={{
                  borderColor: "#454446",
                  textAlign: "left",
                  paddingLeft: "12px",
                }}
              >
                <span
                  className="text-gray-400"
                  style={{ textAlign: "left", display: "block" }}
                >
                  Click to enter props title
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Props Recipients Section */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4">
            Props Recipients
          </h3>
          <div
            className="p-4 rounded-sm border"
            style={{ backgroundColor: "#1B1D21", borderColor: "#454446" }}
          >
            <div className="space-y-3">
              {recipients.map((recipient, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-[#2A2C30] rounded"
                >
                  <span className="text-white text-sm">{recipient}</span>
                  <button
                    onClick={() => handleRemoveRecipient(index)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Add one or more recipient names"
                  value={newRecipient}
                  maxLength={67}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddRecipient()}
                  className="flex-1 px-4 py-2 text-sm bg-[#1B1D21] border rounded text-white placeholder-gray-400 focus:outline-none focus:border-[var(--primary-dark)]"
                  style={{
                    borderColor: "#454446",
                    fontFamily: "Poppins",
                    fontSize: "14px",
                    color: "white",
                  }}
                />
                <button
                  onClick={handleAddRecipient}
                  className="px-4 py-2 text-sm font-medium transition-colors bg-white text-[#212327] rounded hover:bg-gray-100"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* From Section */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4">From</h3>
          <div
            className="p-4 rounded-sm border"
            style={{ backgroundColor: "#1B1D21", borderColor: "#454446" }}
          >
            <div className="space-y-4">
              {/* Name and Calendar on the same row */}
              <div className="flex gap-2">
                <div className="basis-2/3">
                  <label className="block text-white text-sm mb-2">Name</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={50}
                    className="w-full px-4 py-2 text-sm bg-[#1B1D21] border rounded text-white placeholder-gray-400 focus:outline-none focus:border-[var(--primary-dark)]"
                    style={{
                      borderColor: "#454446",
                      fontFamily: "Poppins",
                      fontSize: "14px",
                      color: "white",
                    }}
                  />
                </div>
                <div className="basis-1/3">
                  <label className="block text-white text-sm mb-2">Date *</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => {
                      // Ensure the date is stored exactly as selected, without timezone conversion
                      const selectedDate = e.target.value;
                      console.log('Selected date:', selectedDate);
                      setDate(selectedDate);
                    }}
                    required
                    className="w-full px-2 py-2 text-sm bg-[#1B1D21] border rounded focus:outline-none focus:border-[var(--primary-dark)] cursor-pointer text-white"
                    style={{
                      borderColor: "#454446",
                      fontFamily: "Poppins",
                      fontSize: "14px",
                      minHeight: "40px",
                      textAlign: "center",
                      colorScheme: "dark", // keeps it consistent with dark UI
                    }}
                    placeholder="dd/mm/yyyy"
                  />

                  <style jsx>{`
                    input[type="date"]::-webkit-calendar-picker-indicator {
                      filter: brightness(0) saturate(100%) invert(86%) sepia(5%)
                        saturate(181%) hue-rotate(180deg) brightness(94%)
                        contrast(87%);
                    }
                  `}</style>
                </div>
              </div>
              {/* Message */}
              <div>
                <label className="block text-white text-sm mb-2">Message</label>
                <textarea
                  placeholder="Enter your message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  maxLength={300}
                  className="w-full px-4 py-2 text-sm bg-[#1B1D21] border rounded text-white placeholder-gray-400 focus:outline-none focus:border-[var(--primary-dark)] resize-none"
                  style={{
                    borderColor: "#454446",
                    fontFamily: "Poppins",
                    fontSize: "14px",
                    color: "white",
                  }}
                />
                <p className="text-gray-400 text-xs mt-1">
                  {message.length}/300 characters
                </p>
              </div>
            </div>

            {/* Add Button for From Section */}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  // Handle adding the "From" information to the template
                  if (setFromName) setFromName(name);
                  if (setFromDate) setFromDate(date);
                  if (setFromMessage) setFromMessage(message);
                  console.log("Adding From information to template:", {
                    name,
                    date,
                    message,
                  });
                }}
                className="px-4 py-2 text-sm font-medium transition-colors bg-white text-[#212327] rounded hover:bg-gray-100"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Next button - right justified below container */}
      <div className="flex justify-end flex-shrink-0" style={{ marginTop: "24px" }}>
        <button
          onClick={handleNext}
          className="px-6 py-3 text-sm font-medium transition-colors bg-[var(--primary-dark)] text-[#212327] rounded hover:bg-[#0AFB84]"
        >
          Next
        </button>
      </div>
    </div>
  );
}
