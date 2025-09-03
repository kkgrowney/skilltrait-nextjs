"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import SideNavigation from "@/components/SideNavigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import {
  downloadPropAsPNG,
  downloadImageDirectly,
  downloadFirebaseImage,
} from "@/lib/downloadUtils";

// Helper function to get proxied image URLs (same as in profile page)
const getProxiedUrlForPreview = (imageUrl: string): string => {
  if (!imageUrl) return "";
  return `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
};

// EmailRecipients component
function EmailRecipients({
  onRecipientNamesChange,
}: {
  onRecipientNamesChange?: (names: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [recipientNames, setRecipientNames] = useState("");
  const [showRecipientsInput, setShowRecipientsInput] = useState(false);
  const [message, setMessage] = useState("");
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

  const handleSend = () => {
    if (emails.length === 0) {
      setError("Please add at least one email address");
      return;
    }
    if (!message.trim()) {
      setError("Please enter a message");
      return;
    }

    // TODO: Implement email sending logic
    console.log("Sending emails to:", emails);
    console.log("Message:", message);

    // Clear form after sending
    setEmails([]);
    setRecipientNames("");
    setMessage("");
    setError("");

    alert("Emails sent successfully!");
  };

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <input
          type="email"
          placeholder="Enter one email at a time"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 px-3 py-2 rounded bg-[#1B1D21] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-[var(--primary-dark)]"
          style={{ fontFamily: "Poppins", fontSize: "14px" }}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
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
      <div className="flex flex-wrap gap-2 mb-4">
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

      {/* Recipient Names field */}
      <div className="mb-4">
        <div
          className="p-4 rounded-sm border"
          style={{ backgroundColor: "#1B1D21", borderColor: "#454446" }}
        >
          {showRecipientsInput ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Add one or more recipient names"
                value={recipientNames}
                maxLength={67}
                onChange={(e) => {
                  setRecipientNames(e.target.value);
                  onRecipientNamesChange?.(e.target.value);
                }}
                className="flex-1 px-4 py-2 text-sm bg-[#1B1D21] border rounded text-white placeholder-gray-400 focus:outline-none focus:border-[var(--primary-dark)]"
                style={{
                  borderColor: "#454446",
                  fontFamily: "Poppins",
                  fontSize: "14px",
                  color: "white",
                  textAlign: "left",
                  paddingLeft: "12px",
                }}
              />
              <button
                onClick={() => {
                  setShowRecipientsInput(false);
                }}
                className="px-4 py-2 text-sm font-medium transition-colors bg-white text-[#212327] rounded hover:bg-gray-100"
              >
                Add
              </button>
            </div>
          ) : (
            <div
              onClick={() => setShowRecipientsInput(true)}
              className="w-full px-4 py-2 text-sm bg-[#1B1D21] border rounded text-white placeholder-gray-400 cursor-pointer hover:border-[var(--primary-dark)] transition-colors"
              style={{
                borderColor: "#454446",
                textAlign: "left",
                paddingLeft: "12px",
              }}
            >
              {recipientNames ? (
                <span
                  className="text-white"
                  style={{ textAlign: "left", display: "block" }}
                >
                  {recipientNames}
                </span>
              ) : (
                <span
                  className="text-gray-400"
                  style={{ textAlign: "left", display: "block" }}
                >
                  Add one or more recipient names
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Message field */}
      <div className="mb-4">
        <textarea
          placeholder="Enter message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full px-3 py-2 rounded bg-[#1B1D21] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-[var(--primary-dark)] resize-none"
          style={{ fontFamily: "Poppins", fontSize: "14px" }}
          rows={4}
        />
      </div>

      {/* Send button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSend}
          className="bg-[#00DF71] text-[#212327] px-6 py-2 rounded font-semibold hover:bg-[#0AFB84] transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default function PropDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [prop, setProp] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [recipientNames, setRecipientNames] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Download function for preview image
  const handleDownloadProp = async () => {
    if (!prop) return;

    // Prioritize previewImageUrl (Cloudinary) over other image sources
    const imageUrl =
      prop.previewImageUrl ||
      prop.previewImageBase64 ||
      prop.fullPropImage ||
      "/liquid_death_props.png";
    const filename = `${prop.propsTitle || "prop"}-${Date.now()}.png`;

    console.log("Attempting to download:", { imageUrl, filename });

    try {
      // For Cloudinary URLs, use fetch and blob download
      if (
        imageUrl.includes("cloudinary.com") ||
        imageUrl.includes("res.cloudinary.com")
      ) {
        console.log("Using Cloudinary download method");

        try {
          // Fetch the image as a blob
          const response = await fetch(imageUrl);
          const blob = await response.blob();

          // Create a blob URL
          const blobUrl = window.URL.createObjectURL(blob);

          // Create download link
          const link = document.createElement("a");
          link.href = blobUrl;
          link.download = filename;

          // Trigger download
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Clean up blob URL
          window.URL.revokeObjectURL(blobUrl);

          return;
        } catch (error) {
          console.error("Cloudinary download failed:", error);
          // Fall through to other methods
        }
      }

      // For Firebase Storage URLs, use the optimized download
      if (imageUrl.includes("firebasestorage.googleapis.com")) {
        console.log("Using Firebase download method");
        await downloadFirebaseImage(imageUrl, filename);

        // Show user instructions for the new tab approach
        setTimeout(() => {
          alert(
            `A new tab has opened with your image. To download:\n\n1. Right-click on the image in the new tab\n2. Select "Save image as..."\n3. Choose your download location\n4. Save as: ${filename}`
          );
        }, 500);

        return;
      }

      // For base64 images, try direct download
      if (imageUrl.startsWith("data:image")) {
        console.log("Using base64 download method");
        await downloadImageDirectly(imageUrl, filename);
        return;
      }

      // Try high-resolution canvas download for other URLs
      console.log("Using canvas download method");
      await downloadPropAsPNG(imageUrl, prop.propsTitle);
    } catch (error) {
      console.error("Primary download failed, trying fallback:", error);

      try {
        // Fallback to direct download
        console.log("Using fallback download method");
        await downloadImageDirectly(imageUrl, filename);
      } catch (fallbackError) {
        console.error("Fallback download also failed:", fallbackError);
        alert("Failed to download prop. Please try again.");
      }
    }
  };

  useEffect(() => {
    const load = async () => {
      if (!user?.uid || !params?.id) return;
      setLoading(true);
      const ref = doc(db, "users", user.uid, "props", params.id as string);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setProp({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    };
    load();
  }, [user?.uid, params?.id]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#1A1D21" }}>
      <SideNavigation />
      <div className="md:ml-[66px] ml-0 p-4 md:p-8">
        <div className="w-full flex justify-center">
          <div className="w-full max-w-6xl">
            <div className="flex items-center gap-2 mb-4">
              <button
                type="button"
                aria-label="Go back"
                onClick={() => router.push(`/profile`)}
                className="flex items-center text-gray-300 hover:text-white transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-white">Prop Detail</h1>
            </div>

            {loading ? (
              <div className="text-gray-400">Loading...</div>
            ) : !prop ? (
              <div className="text-gray-400">Not found</div>
            ) : (
              <div className="flex flex-col lg:flex-row items-start justify-center gap-6">
                {/* Left Column - Prop Image */}
                <div className="flex justify-center">
                  <div
                    className="relative bg-white rounded"
                    style={{
                      borderRadius: "4px",
                      width: "600px",
                      height: "480px",
                    }}
                  >
                    {/* Use the saved Cloudinary preview image - this should match exactly what was generated in ShareStep */}
                    {prop.previewImageUrl ? (
                      <img
                        src={prop.previewImageUrl}
                        alt={prop.propsTitle || "Prop"}
                        className="relative z-20 w-full h-full"
                        style={{
                          borderRadius: "4px",
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          objectPosition: "center",
                        }}
                      />
                    ) : prop.previewImageBase64 ? (
                      <img
                        src={prop.previewImageBase64}
                        alt={prop.propsTitle || "Prop"}
                        className="relative z-20 w-full h-full"
                        style={{
                          borderRadius: "4px",
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          objectPosition: "center",
                        }}
                      />
                    ) : prop.achievement?.backgroundImage ||
                      prop.achievement?.props ? (
                      /* Fallback: Reconstruct from template data like in preview */
                      <>
                        {/* Background layer (props background 600x400) */}
                        <div
                          className="absolute inset-0 z-10 overflow-hidden"
                          style={{ borderRadius: "4px" }}
                        >
                          <img
                            src={getProxiedUrlForPreview(
                              prop.achievement?.backgroundImage || ""
                            )}
                            alt={prop.propsTitle || ""}
                            className="w-full h-full object-cover"
                            style={{
                              borderRadius: "4px",
                              objectFit: "cover",
                              // objectPosition: "center",
                            }}
                          />
                        </div>
                        {/* Foreground props image */}
                        <img
                          src={getProxiedUrlForPreview(
                            prop.achievement?.props || ""
                          )}
                          alt={prop.propsTitle || ""}
                          className="relative z-20 w-full h-full"
                          style={{
                            borderRadius: "4px",
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            // objectPosition: "center",
                          }}
                        />
                        {/* White header with logo/company - matching Dollar Shave Club design */}
                        <div
                          className="absolute top-0 left-0 right-0 bg-white border-b border-[#E4E4E4] z-30"
                          style={{
                            height: "60px",
                            borderRadius: "4px 4px 0 0",
                          }}
                        >
                          <div
                            className="absolute flex items-center gap-3 px-4 justify-between"
                            style={{
                              height: "100%",
                              width: "100%",
                              left: 0,
                              top: 0,
                            }}
                          >
                            {prop.achievement?.logoImage ? (
                              <img
                                src={getProxiedUrlForPreview(
                                  prop.achievement.logoImage
                                )}
                                alt="Logo"
                                className="object-contain relative z-20"
                                style={{
                                  height: "40px",
                                  maxWidth: "250px",
                                  width: "auto",
                                  objectPosition: "left",
                                  objectFit: "contain",
                                }}
                              />
                            ) : null}
                            <div
                              className="text-black font-medium text-[25px]"
                              style={{ maxWidth: "70%" }}
                            >
                              {prop.propsTitle || ""}
                            </div>
                          </div>
                        </div>
                        {/* Message overlay - matching Dollar Shave Club design */}
                        {(prop.achievement?.fromName ||
                          prop.achievement?.fromMessage ||
                          prop.achievement?.fromDate) && (
                          <div className="absolute top-20 left-4 z-30 font-semibold">
                            {(prop.propsRecipients.length > 0 ||
                              recipientNames) && (
                              <div
                                className="prop-inside-box text-white px-3 py-3 rounded-lg shadow-lg max-w-[296px] break-words"
                                style={{
                                  fontFamily: "Poppins",
                                  fontSize: "16px",
                                  fontWeight: "500",
                                  lineHeight: "110%",
                                  marginTop: "10px",
                                }}
                              >
                                Props:
                                <br />
                                <span className="whitespace-normal break-words">
                                  {recipientNames ||
                                    (prop.propsRecipients &&
                                      prop.propsRecipients.join(", "))}
                                </span>
                              </div>
                            )}
                            <div
                              className="prop-inside-box text-white px-3 py-3 rounded-lg shadow-lg max-w-[296px] min-w-[300px]"
                              style={{
                                position: "absolute",
                                top:
                                  prop.propsRecipients.length > 0 ||
                                  recipientNames
                                    ? "100%"
                                    : "0px",
                                marginTop: "12px",
                                fontFamily: "Poppins",
                                fontSize: "16px",
                                fontWeight: "400",
                              }}
                            >
                              {/* From name and date on same line with flex justify-between */}
                              {(prop.achievement?.fromName ||
                                prop.achievement?.fromDate) && (
                                <div className="flex justify-between items-center mb-2">
                                  {prop.achievement?.fromName && (
                                    <div className="font-semibold text-[14px]">
                                      {prop.achievement.fromName}
                                    </div>
                                  )}
                                  {prop.achievement?.fromDate && (
                                    <div className="text-white text-[14px]">
                                      {(() => {
                                        const [year, month, day] =
                                          prop.achievement.fromDate.split("-");
                                        return `${month}/${day}/${year.slice(
                                          2
                                        )}`;
                                      })()}
                                    </div>
                                  )}
                                </div>
                              )}
                              {prop.achievement?.fromMessage && (
                                <div className="text-sm leading-relaxed">
                                  {prop.achievement.fromMessage}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      /* Fallback: Show placeholder when no images available */
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <div className="text-gray-500 text-sm text-center">
                          <div>No Preview Available</div>
                          <div className="text-[25px] font-medium mt-1">
                            {prop.propsTitle || "Prop"}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Share Prop and Email Recipients */}
                <div className="w-full max-w-md space-y-4">
                  {/* Share Prop Container */}
                  <div className="bg-[#212327] rounded-lg shadow-sm border border-[#454446] p-4">
                    <h3 className="text-lg font-medium text-white mb-3">
                      Share Prop
                    </h3>
                    <div className="flex flex-wrap justify-start gap-3 mb-2 sm:gap-4 md:gap-5">
                      {[
                        {
                          label: "Copy Link",
                          bg: "bg-gray-600 hover:bg-gray-500",
                          icon: (
                            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-1 16H8V7h10v14z" />
                          ),
                          onClick: () => {
                            const shareUrl = `${window.location.origin}/share/${params.id}`;
                            navigator.clipboard
                              .writeText(shareUrl)
                              .then(() => {
                                alert("Share link copied to clipboard!");
                              })
                              .catch(() => {
                                // Fallback for older browsers
                                const textArea =
                                  document.createElement("textarea");
                                textArea.value = shareUrl;
                                document.body.appendChild(textArea);
                                textArea.select();
                                document.execCommand("copy");
                                document.body.removeChild(textArea);
                                alert("Share link copied to clipboard!");
                              });
                          },
                        },
                        {
                          label: "Download",
                          bg: "bg-gray-600 hover:bg-gray-500",
                          icon: (
                            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                          ),
                          onClick: handleDownloadProp,
                        },
                        {
                          label: "Share on LinkedIn",
                          bg: "bg-[#0077B5] hover:bg-[#005885]",
                          icon: (
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                          ),
                          onClick: () => {
                            const shareUrl = `${window.location.origin}/share/${params.id}`;
                            const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                              shareUrl
                            )}`;
                            window.open(linkedinUrl, "_blank");
                          },
                        },
                        {
                          label: "Share on Twitter",
                          bg: "bg-black hover:bg-gray-800",
                          icon: (
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          ),
                          onClick: () => {
                            const shareUrl = `${window.location.origin}/share/${params.id}`;
                            const text = `${
                              prop?.userDisplayName ||
                              prop?.achievement?.fromName ||
                              "Someone"
                            } sent props via SkillTrait! Check it out:`;
                            const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                              text
                            )}&url=${encodeURIComponent(shareUrl)}`;
                            window.open(twitterUrl, "_blank");
                          },
                        },
                        {
                          label: "Share on Facebook",
                          bg: "bg-[#1877F2] hover:bg-[#166FE5]",
                          icon: (
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          ),
                          onClick: () => {
                            const shareUrl = `${window.location.origin}/share/${params.id}`;
                            const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                              shareUrl
                            )}`;
                            window.open(facebookUrl, "_blank");
                          },
                        },
                      ].map(({ label, bg, icon, onClick }, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className={`p-3 sm:p-2 md:p-3 rounded-full ${bg} transition-colors flex items-center justify-center`}
                          aria-label={label}
                          onClick={onClick}
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
                    {/* Share URL Display */}
                    <div className="mt-4 p-3 bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-400 mb-2">
                        Share this prop publicly:
                      </p>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={`${
                            typeof window !== "undefined"
                              ? window.location.origin
                              : ""
                          }/share/${params.id}`}
                          readOnly
                          className="flex-1 px-2 py-1 text-xs bg-gray-700 text-white rounded border border-gray-600"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const shareUrl = `${window.location.origin}/share/${params.id}`;
                            navigator.clipboard
                              .writeText(shareUrl)
                              .then(() => {
                                alert("Share link copied to clipboard!");
                              })
                              .catch(() => {
                                const textArea =
                                  document.createElement("textarea");
                                textArea.value = shareUrl;
                                document.body.appendChild(textArea);
                                textArea.select();
                                document.execCommand("copy");
                                document.body.removeChild(textArea);
                                alert("Share link copied to clipboard!");
                              });
                          }}
                          className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Copy
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end mt-2">
                      <button
                        type="button"
                        className="px-3 py-1 text-xs text-white rounded hover:opacity-90"
                        style={{ backgroundColor: "#ED6568" }}
                        onClick={() => setShowDeleteModal(true)}
                      >
                        Delete Prop
                      </button>
                    </div>
                  </div>

                  {/* Email Recipients Container */}
                  <div className="bg-[#212327] rounded-lg shadow-sm border border-[#454446] p-4">
                    <h3 className="text-lg font-medium text-white mb-3">
                      Email Recipients
                    </h3>
                    <EmailRecipients
                      onRecipientNamesChange={setRecipientNames}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
