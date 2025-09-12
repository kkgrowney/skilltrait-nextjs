"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import SideNavigation from "@/components/SideNavigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { useCustomerIO } from "@/hooks/useCustomerIO";
import toast from "react-hot-toast";
import {
  downloadPropAsPNG,
  downloadImageDirectly,
  downloadFirebaseImage,
} from "@/lib/downloadUtils";
import { uploadToCloudinary } from "@/lib/cloudinary";

// Helper function to get proxied image URLs (same as in profile page)
const getProxiedUrlForPreview = (imageUrl: string): string => {
  if (!imageUrl) return "";
  return `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
};

// Function to generate preview image for templates (similar to ShareStep)
const generateTemplatePreviewImage = async (template: any): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Create a canvas to composite the images
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Could not get canvas context");
      }

      // Set canvas size to match prop detail page
      canvas.width = 600;
      canvas.height = 480;

      // Load background image
      const backgroundImg = new Image();
      backgroundImg.crossOrigin = "anonymous";

      backgroundImg.onload = () => {
        console.log("Background image loaded successfully");
        // Draw background with object-fit: cover behavior
        const canvasAspectRatio = canvas.width / canvas.height;
        const imageAspectRatio = backgroundImg.width / backgroundImg.height;

        let drawWidth, drawHeight, drawX, drawY;

        if (imageAspectRatio > canvasAspectRatio) {
          // Image is wider than canvas - fit to height, crop width
          drawHeight = canvas.height;
          drawWidth = backgroundImg.width * (canvas.height / backgroundImg.height);
          drawX = (canvas.width - drawWidth) / 2;
          drawY = 0;
        } else {
          // Image is taller than canvas - fit to width, crop height
          drawWidth = canvas.width;
          drawHeight = backgroundImg.height * (canvas.width / backgroundImg.width);
          drawX = 0;
          drawY = (canvas.height - drawHeight) / 2;
        }

        ctx.drawImage(backgroundImg, drawX, drawY, drawWidth, drawHeight);

        // Load props image (main illustration)
        const propsImg = new Image();
        propsImg.crossOrigin = "anonymous";

        propsImg.onload = () => {
          console.log("Props image loaded successfully");
          // Draw props image on top of background
          const propsAspectRatio = propsImg.width / propsImg.height;
          let propsDrawWidth, propsDrawHeight, propsDrawX, propsDrawY;

          if (propsAspectRatio > canvasAspectRatio) {
            // Props image is wider - fit to height, crop width
            propsDrawHeight = canvas.height;
            propsDrawWidth = propsImg.width * (canvas.height / propsImg.height);
            propsDrawX = (canvas.width - propsDrawWidth) / 2;
            propsDrawY = 0;
          } else {
            // Props image is taller - fit to width, crop height
            propsDrawWidth = canvas.width;
            propsDrawHeight = propsImg.height * (canvas.width / propsImg.width);
            propsDrawX = 0;
            propsDrawY = (canvas.height - propsDrawHeight) / 2;
          }

          ctx.drawImage(propsImg, propsDrawX, propsDrawY, propsDrawWidth, propsDrawHeight);

          // Convert canvas to base64
          const previewDataUrl = canvas.toDataURL("image/png");
          
          // Upload to Cloudinary
          try {
            console.log("Uploading generated preview to Cloudinary...");
            uploadToCloudinary(previewDataUrl).then((cloudinaryUrl) => {
              console.log("Successfully uploaded to Cloudinary:", cloudinaryUrl);
              resolve(cloudinaryUrl);
            }).catch((error) => {
              console.error("Cloudinary upload failed, using base64:", error);
              resolve(previewDataUrl);
            });
          } catch (error) {
            console.error("Error uploading to Cloudinary:", error);
            resolve(previewDataUrl);
          }
        };

        propsImg.onerror = () => {
          console.error("Failed to load props image");
          resolve("");
        };

        propsImg.src = propsUrl;
      };

      backgroundImg.onerror = () => {
        console.error("Failed to load background image");
        resolve("");
      };

      const backgroundUrl = getProxiedUrlForPreview(template.achievement?.backgroundImage || "");
      const propsUrl = getProxiedUrlForPreview(template.achievement?.props || "");
      
      console.log("Generated URLs for template preview:", {
        backgroundUrl,
        propsUrl,
        originalBackground: template.achievement?.backgroundImage,
        originalProps: template.achievement?.props
      });
      
      backgroundImg.src = backgroundUrl;
    } catch (error) {
      console.error("Error generating template preview:", error);
      reject(error);
    }
  });
};

// EmailRecipients component
function EmailRecipients({ propId, prop }: { propId: string; prop: any }) {
  const { user } = useAuth();
  const { updateCustomer, isLoading, error: apiError } = useCustomerIO();
  const [email, setEmail] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);

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

  const handleSend = async () => {
    if (emails.length === 0) {
      setError("Please add at least one email address");
      return;
    }
    if (!message.trim()) {
      setError("Please enter a message");
      return;
    }
    if (!user?.email) {
      setError("User email not available");
      return;
    }

    setIsSending(true);
    setError("");

    try {
      let successCount = 0;
      let errorCount = 0;

      // Loop through each recipient email and send individual PUT requests
      for (const recipientEmail of emails) {
        try {
          // Prepare the Customer.io API body for each recipient
          // Get image URL for Customer.io - prioritize Cloudinary URL, exclude base64 data
          // If no image URL is available, use the share URL as fallback to ensure Customer.io always has a valid image reference
          const imageUrl = prop?.previewImageUrl || prop?.fullPropImage || `${window.location.origin}/share/${propId}`;

          // Log image URL for debugging
          console.log(`Image URL for Customer.io:`, {
            url: imageUrl,
            bytes: new TextEncoder().encode(imageUrl).length,
            isCloudinary: imageUrl.includes('cloudinary.com'),
            isBase64: imageUrl.startsWith('data:image')
          });

          const customerData = {
            id: recipientEmail, // Use recipient email as ID
            email: recipientEmail, // Use recipient email as email
            anonymous_id: "string", // String value as specified
            sendProps_at: Math.floor(Date.now() / 1000), // Current timestamp as Unix seconds
            _update: "boolean", // String value as specified
            unsubscribed: "boolean", // String value as specified
            consequatfc: "string", // String value as specified
            propsMessage: message, // The message entered by user
            propShareUrl: `${window.location.origin}/share/${propId}`, // Share URL of the prop
            propImage: imageUrl, // Cloudinary URL (no base64 data)
            propsSenderName: prop?.achievement?.fromName || prop?.userDisplayName || "" // Name of the sender of the prop
          };

          // Final validation - ensure propImage is within limits
          const finalPropImageBytes = new TextEncoder().encode(customerData.propImage).length;
          if (finalPropImageBytes > 2000) {
            console.error('ERROR: propImage exceeds 2000 bytes!', {
              value: customerData.propImage,
              bytes: finalPropImageBytes
            });
            // Force it to a safe value
            customerData.propImage = 'Image URL too large';
          }

          console.log(`Sending to Customer.io for ${recipientEmail}:`, customerData);
          console.log(`propImage field details:`, {
            value: customerData.propImage,
            bytes: new TextEncoder().encode(customerData.propImage).length,
            type: typeof customerData.propImage
          });
          console.log(`propShareUrl field details:`, {
            value: customerData.propShareUrl,
            bytes: new TextEncoder().encode(customerData.propShareUrl).length,
            type: typeof customerData.propShareUrl
          });

          // Call Customer.io API for this specific recipient
          const success = await updateCustomer(recipientEmail, customerData);

          if (success) {
            successCount++;
          } else {
            errorCount++;
            console.error(`Failed to send to ${recipientEmail}`);
          }
        } catch (err) {
          errorCount++;
          console.error(`Error sending to ${recipientEmail}:`, err);
        }
      }

      // Clear form after processing all emails
      setEmails([]);
      setMessage("");
      setError("");

      // Show appropriate success/error message
      if (successCount > 0 && errorCount === 0) {
        toast.success(`Props sent successfully to all ${successCount} recipients!`);
      } else if (successCount > 0 && errorCount > 0) {
        toast.success(`Props sent to ${successCount} recipients. ${errorCount} failed.`);
      } else {
        setError("Failed to send props to any recipients. Please try again.");
      }
    } catch (err) {
      console.error("Error sending props:", err);
      setError("An error occurred while sending props. Please try again.");
    } finally {
      setIsSending(false);
    }
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

      {/* Error display */}
      {(error || apiError) && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
          <p className="text-red-300 text-sm">{error || apiError}</p>
        </div>
      )}

      {/* Send button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSend}
          disabled={isSending || isLoading}
          className="bg-[#00DF71] text-[#212327] px-6 py-2 rounded font-semibold hover:bg-[#0AFB84] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending || isLoading ? "Sending..." : "Send"}
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [generatedPreviewUrl, setGeneratedPreviewUrl] = useState<string | null>(null);

  // Download function for preview image
  const handleDownloadProp = async () => {
    if (!prop) return;

    // Prioritize previewImageUrl (Cloudinary) over other image sources
    const imageUrl =
      prop.previewImageUrl ||
      generatedPreviewUrl ||
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
        const propData = { id: snap.id, ...snap.data() };
        setProp(propData);
        
        // Generate preview image for free templates that don't have previewImageUrl
        console.log("Prop data for preview generation:", {
          hasPreviewImageUrl: !!(propData as any).previewImageUrl,
          hasPreviewImageBase64: !!(propData as any).previewImageBase64,
          hasBackgroundImage: !!(propData as any).achievement?.backgroundImage,
          hasProps: !!(propData as any).achievement?.props
        });
        
        if (!(propData as any).previewImageUrl && !(propData as any).previewImageBase64 && 
            (propData as any).achievement?.backgroundImage && (propData as any).achievement?.props) {
          console.log("Generating template preview image...");
          try {
            const previewUrl = await generateTemplatePreviewImage(propData);
            console.log("Generated preview URL:", previewUrl);
            setGeneratedPreviewUrl(previewUrl);
          } catch (error) {
            console.error("Failed to generate template preview:", error);
          }
        } else {
          console.log("Skipping preview generation - conditions not met");
        }
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
                    {(() => {
                      console.log("Image rendering decision:", {
                        hasPropPreviewImageUrl: !!prop.previewImageUrl,
                        hasGeneratedPreviewUrl: !!generatedPreviewUrl,
                        hasPropPreviewImageBase64: !!prop.previewImageBase64,
                        hasAchievementBackground: !!prop.achievement?.backgroundImage,
                        hasAchievementProps: !!prop.achievement?.props
                      });
                      return prop.previewImageUrl || generatedPreviewUrl;
                    })() ? (
                      <img
                        src={prop.previewImageUrl || generatedPreviewUrl}
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
                            {prop.propsRecipients.length > 0 && (
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
                                  {prop.propsRecipients &&
                                    prop.propsRecipients.join(", ")}
                                </span>
                              </div>
                            )}
                            <div
                              className="prop-inside-box text-white px-3 py-3 rounded-lg shadow-lg max-w-[296px] min-w-[300px]"
                              style={{
                                position: "absolute",
                                top:
                                  prop.propsRecipients.length > 0
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
                          label: "Share Tab",
                          bg: "bg-gray-600 hover:bg-gray-500",
                          icon: (
                            <>
                              <path d="M21.25 24H2.75C1.23 24 0 22.78 0 21.28V6.95C0 5.45 1.23 4.24 2.75 4.24H6.25C6.66 4.24 7 4.57 7 4.98C7 5.39 6.66 5.72 6.25 5.72H2.75C2.06 5.72 1.5 6.27 1.5 6.95V21.28C1.5 21.96 2.06 22.52 2.75 22.52H21.25C21.94 22.52 22.5 21.96 22.5 21.28V12.88C22.5 12.47 22.84 12.14 23.25 12.14C23.66 12.14 24 12.47 24 12.88V21.28C24 22.78 22.77 24 21.25 24Z" />
                              <path d="M6.41 15.53C6.35 15.53 6.3 15.52 6.24 15.51C5.9 15.43 5.65 15.15 5.65 14.81V13.36C5.65 8.13 10.11 3.89 15.59 3.89H15.84V0.73C15.84 0.43 16.03 0.16 16.32 0.05C16.61 -0.06 16.94 -0.01 17.16 0.22L23.79 6.78C24.07 7.06 24.07 7.51 23.79 7.79L17.16 14.35C16.94 14.58 16.61 14.63 16.32 14.52C16.03 14.41 15.84 14.14 15.84 13.84V10.69H14.63C11.42 10.69 8.54 12.38 7.11 15.12C6.98 15.37 6.7 15.53 6.41 15.53ZM15.59 5.34C11.31 5.34 7.76 8.41 7.24 12.36C9.09 10.39 11.75 9.23 14.63 9.23H16.61C17.03 9.23 17.37 9.55 17.37 9.96V12.04L22.17 7.29L17.37 2.54V4.61C17.37 5.02 17.03 5.34 16.61 5.34H15.59Z" />
                            </>
                          ),
                          onClick: () => {
                            const shareUrl = `${window.location.origin}/share/${params.id}`;
                            window.open(shareUrl, "_blank");
                          },
                        },
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
                                toast.success("Share link copied to clipboard!");
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
                                toast.success("Share link copied to clipboard!");
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
                            width="28"
                            height="28"
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
                                toast.success("Share link copied to clipboard!");
                              })
                              .catch(() => {
                                const textArea =
                                  document.createElement("textarea");
                                textArea.value = shareUrl;
                                document.body.appendChild(textArea);
                                textArea.select();
                                document.execCommand("copy");
                                document.body.removeChild(textArea);
                                toast.success("Share link copied to clipboard!");
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
                    <EmailRecipients propId={params.id as string} prop={prop} />
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
