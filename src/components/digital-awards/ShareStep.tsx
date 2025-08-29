"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  saveUserProp,
  uploadAsset,
  createTemplateWithAssets,
  savePropWithImage,
  updatePropWithImage,
  saveUserTemplateAssets,
} from "@/lib/firebase";
import Link from "next/link";
import AuthModal from "./AuthModal";

interface ShareStepProps {
  onPrevious: () => void;
  onAuthSuccess?: () => void;
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
  onAuthSuccess,
  selectedTemplate,
  companyNameText,
  uploadedLogoFile,
  backgroundNameText,
  uploadedBackgroundFile,
  propsTitle,
  propsRecipients,
  fromName,
  fromDate,
  fromMessage,
}: ShareStepProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAward, setGeneratedAward] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [savedPropId, setSavedPropId] = useState<string | null>(null);
  const [processStep, setProcessStep] = useState<string>("");
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    null
  );
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [saveAsTemplate, setSaveAsTemplate] = useState<boolean>(true);
  // Toggle to show/hide the raw image URL in the UI (kept in code for debugging)
  const showImageUrlDebug = false;
  // Toggle to show/hide the generated award text block in the UI
  const showGeneratedAwardText = false;
  // Toggle to show/hide the login notice link
  const showLoginNotice = false;

  const handleGenerateAward = async () => {
    setIsGenerating(true);
    setProcessStep("Starting process...");

    try {
      // Get current user
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }

      console.log({ selectedTemplate });

      // Step 1: Upload assets and create template
      setProcessStep("Uploading assets and creating template...");
      const uploadedAssets = await uploadAssetsAndCreateTemplate(user.uid);

      // Step 2: Generate preview image locally first
      setProcessStep("Generating preview image...");
      await generatePreviewImage(uploadedAssets);

      // Step 3: Save the preview image to database
      setProcessStep("Saving preview image to database...");

      // Log the uploaded assets for debugging
      console.log("Uploaded assets for preview:", uploadedAssets);
      console.log("Selected template:", selectedTemplate);
      console.log("Template achievement structure:", {
        props: selectedTemplate?.achievement?.props,
        logoImage: selectedTemplate?.achievement?.logoImage,
        backgroundImage: selectedTemplate?.achievement?.backgroundImage,
        propsTitle,
        fromName,
        fromDate,
        fromMessage,
      });

      // Save the preview image to the user's props collection
      try {
        const propData = {
          fromMessage: fromMessage || "",
          propsTitle: propsTitle || "",
          propsRecipients: propsRecipients || [],
          fromDate: fromDate || "",
          fromName: fromName || "",
          templateId: selectedTemplate?.id || "",
          isPrivateTemplate: false,
          status: "preview_generated",
          achievement: {
            props: selectedTemplate?.achievement?.props || "",
            logoImage:
              uploadedAssets.logoUrl ||
              selectedTemplate?.achievement?.logoImage ||
              "",
            backgroundImage:
              uploadedAssets.backgroundUrl ||
              selectedTemplate?.achievement?.backgroundImage ||
              "",
            propsTitle: propsTitle || "",
            fromName: fromName || "",
            fromDate: fromDate || "",
            fromMessage: fromMessage || "",
            tags: selectedTemplate?.achievement?.tags || [],
            company:
              companyNameText || selectedTemplate?.achievement?.company || "",
          },
          logoUrl: uploadedAssets.logoUrl || null,
          backgroundUrl: uploadedAssets.backgroundUrl || null,
          previewImageBase64: previewImageUrl, // Save the base64 preview image
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const propId = await saveUserProp(user.uid, propData);
        setSavedPropId(propId);
        console.log("Preview image saved to database with prop ID:", propId);
        setProcessStep("Preview image saved successfully!");

        // Step 4: If user selected "Save as reusable template", create template in user's collection
        if (saveAsTemplate) {
          setProcessStep("Creating reusable template...");
          try {
            const userTemplateId = await createPropInUserSubcollection(
              user.uid,
              uploadedAssets
            );
            console.log(
              "Successfully created reusable template with ID:",
              userTemplateId
            );
            setProcessStep("Reusable template created successfully!");
          } catch (error) {
            console.error("Error creating reusable template:", error);
            setProcessStep("Template creation failed, but prop was saved");
          }
        }

        // Clear all localStorage persistence for digital awards generator
        if (typeof window !== "undefined") {
          localStorage.removeItem("digital-awards-current-step");
          localStorage.removeItem("digital-awards-active-tab");
          localStorage.removeItem("digital-awards-selected-template");
          localStorage.removeItem("digital-awards-show-template-detail");
          localStorage.removeItem("digital-awards-logo-visible");
          localStorage.removeItem("digital-awards-company-name");
          localStorage.removeItem("digital-awards-background-visible");
          localStorage.removeItem("digital-awards-background-name");
          localStorage.removeItem("digital-awards-props-title");
          localStorage.removeItem("digital-awards-props-recipients");
          localStorage.removeItem("digital-awards-from-name");
          localStorage.removeItem("digital-awards-from-date");
          localStorage.removeItem("digital-awards-from-message");
          localStorage.removeItem("digital-awards-filters");
          localStorage.removeItem("digital-awards-search-query");
          console.log("Cleared all digital awards localStorage persistence");
        }

        // Keep user on Share step to see generated award
        // Only clear localStorage so next visit will be fresh
        console.log("Award generated successfully! User stays on Share step.");
      } catch (error) {
        console.error("Error saving preview image to database:", error);
        setProcessStep("Error saving preview image");
      }

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

Date: ${
          fromDate
            ? (() => {
                const [year, month, day] = fromDate.split("-");
                return `${month}/${day}/${year.slice(2)}`;
              })()
            : new Date().toLocaleDateString()
        }
Certificate ID: PREVIEW-${Date.now()}

This digital award recognizes excellence and dedication in professional development.
        `;

        setGeneratedAward(award);
        setIsGenerating(false);
        setProcessStep("");
      }, 2000);
    } catch (error) {
      console.error("Error generating award:", error);
      setIsGenerating(false);
      setProcessStep("");
      // Handle error appropriately
    }
  };

  // Step 1: Upload assets and create template
  const uploadAssetsAndCreateTemplate = async (userId: string) => {
    const uploadedAssets: any = {
      logoUrl: null,
      backgroundUrl: null,
    };

    try {
      // Upload logo if provided
      if (uploadedLogoFile) {
        const logoPath = `users/${userId}/assets/logos/${Date.now()}_${
          uploadedLogoFile.name
        }`;
        uploadedAssets.logoUrl = await uploadAsset(uploadedLogoFile, logoPath);
      }

      // Upload background if provided
      if (uploadedBackgroundFile) {
        const backgroundPath = `users/${userId}/assets/backgrounds/${Date.now()}_${
          uploadedBackgroundFile.name
        }`;
        uploadedAssets.backgroundUrl = await uploadAsset(
          uploadedBackgroundFile,
          backgroundPath
        );
      }

      // Always ensure we have the base template data, even if no custom assets are uploaded
      if (selectedTemplate?.achievement) {
        uploadedAssets.baseTemplateData = {
          // props should contain the props image URL (the main template image)
          props: selectedTemplate.achievement.props || "",
          logoImage: selectedTemplate.achievement.logoImage || "",
          // backgroundImage should contain the background image URL
          backgroundImage:
            uploadedAssets.backgroundUrl ||
            selectedTemplate.achievement.backgroundImage ||
            "",
          // Add the text content as separate fields
          propsTitle: propsTitle || "",
          fromName: fromName || "",
          fromDate: fromDate || "",
          fromMessage: fromMessage || "",
          tags: selectedTemplate.achievement.tags || [],
          company: selectedTemplate.achievement.company || "",
        };
      }

      return uploadedAssets;
    } catch (error) {
      console.error("Error uploading assets and creating template:", error);
      throw error;
    }
  };

  // Step 2: Create prop in user subcollection
  const createPropInUserSubcollection = async (
    userId: string,
    uploadedAssets: any
  ) => {
    try {
      let templateId = selectedTemplate?.id || "";
      let isPrivateTemplate = false;
      let userTemplateId = null;

      // If user wants to save as template, create a template in their subcollection
      if (saveAsTemplate) {
        try {
          const templateData = {
            achievement: {
              // props should contain the props image URL (the main template image)
              props: selectedTemplate?.achievement?.props || "",
              logoImage:
                uploadedAssets.logoUrl ||
                selectedTemplate?.achievement?.logoImage ||
                "",
              // backgroundImage should contain the background image URL
              backgroundImage:
                uploadedAssets.backgroundUrl ||
                selectedTemplate?.achievement?.backgroundImage ||
                "",
              // Add the text content as separate fields
              propsTitle: propsTitle || "",
              fromName: fromName || "",
              fromDate: fromDate || "",
              fromMessage: fromMessage || "",
              tags: selectedTemplate?.achievement?.tags || [],
              company:
                companyNameText || selectedTemplate?.achievement?.company || "",
            },
            isPrivate: true,
            userRef: userId,
            templateType: "props",
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          // Save template to user's subcollection
          userTemplateId = await saveUserTemplateAssets(userId, {
            logoUrl: uploadedAssets.logoUrl || null,
            backgroundUrl: uploadedAssets.backgroundUrl || null,
            company:
              companyNameText || selectedTemplate?.achievement?.company || "",
            templateId: templateId, // Keep original template ID as reference
            basePropsUrl: selectedTemplate?.achievement?.props || null,
            achievement: templateData.achievement,
            isPrivate: true,
            templateType: "props",
          });

          console.log("Saved user template with ID:", userTemplateId);
          console.log("Template data:", templateData);
          isPrivateTemplate = true;
        } catch (error) {
          console.error("Error saving user template:", error);
          // Continue without template saving if it fails
        }
      }

      const propData = {
        fromMessage: fromMessage || "",
        propsTitle: propsTitle || "",
        propsRecipients: propsRecipients || [],
        fromDate: fromDate || "",
        fromName: fromName || "",
        templateId: templateId, // Keep original template ID
        userTemplateId: userTemplateId, // Add reference to user's saved template
        isPrivateTemplate: isPrivateTemplate,
        status: "pending_image_generation",
        // Include the achievement data that the cloud function needs
        achievement: {
          // props should contain the props image URL (the main template image)
          props: selectedTemplate?.achievement?.props || "",
          logoImage:
            uploadedAssets.logoUrl ||
            selectedTemplate?.achievement?.logoImage ||
            "",
          // backgroundImage should contain the background image URL
          backgroundImage:
            uploadedAssets.backgroundUrl ||
            selectedTemplate?.achievement?.backgroundImage ||
            "",
          // Add the text content as separate fields
          propsTitle: propsTitle || "",
          fromName: fromName || "",
          fromDate: fromDate || "",
          fromMessage: fromMessage || "",
          tags: selectedTemplate?.achievement?.tags || [],
          company:
            companyNameText || selectedTemplate?.achievement?.company || "",
        },
        // Store the actual asset URLs for this specific prop
        logoUrl: uploadedAssets.logoUrl || null,
        backgroundUrl: uploadedAssets.backgroundUrl || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const propId = await saveUserProp(userId, propData);
      console.log("Created prop with ID:", propId);
      console.log("Prop data:", propData);
      return propId;
    } catch (error) {
      console.error("Error creating prop in user subcollection:", error);
      throw error;
    }
  };

  // Step 3: Generate image and save to prop document
  const generateAndSaveImage = async (
    userId: string,
    propId: string,
    uploadedAssets: {
      logoUrl?: string | null;
      backgroundUrl?: string | null;
    } = {}
  ) => {
    try {
      // First, get the prop data to ensure we have the latest information
      console.log("Generating image for prop:", propId);
      console.log("Uploaded assets:", uploadedAssets);

      // Call our proxy API route instead of the cloud function directly
      const imageUrl = `/api/generate-image?user=${userId}&prop=${propId}`;

      console.log("Attempting to fetch image from:", imageUrl);
      console.log("Prop ID being sent:", propId);

      // Fetch the image from our proxy API route
      const response = await fetch(imageUrl, {
        method: "GET",
        headers: {
          Accept: "image/png",
        },
      });

      if (!response.ok) {
        let errorBody = "";
        try {
          errorBody = await response.text();
        } catch {}
        console.warn(
          "API route response:",
          response.status,
          response.statusText,
          errorBody
        );
        // Gracefully fall back to placeholder and continue UI flow
        const placeholderImageUrl = `/generated_placeholder.png`;
        await updatePropWithImage(userId, propId, placeholderImageUrl);
        return placeholderImageUrl;
      }

      // Get the image as blob
      let imageBlob: Blob;
      try {
        imageBlob = await response.blob();
      } catch (e) {
        console.warn("Failed reading image blob:", e);
        const placeholderImageUrl = `/generated_placeholder.png`;
        await updatePropWithImage(userId, propId, placeholderImageUrl);
        return placeholderImageUrl;
      }

      // Upload the image to Firebase Storage
      const imagePath = `users/${userId}/props/${propId}/generated_image.png`;
      const uploadedImageUrl = await uploadAsset(
        new File([imageBlob], "generated_prop.png", { type: "image/png" }),
        imagePath
      );

      // Update the prop document with the uploaded image URL
      await updatePropWithImage(userId, propId, uploadedImageUrl);

      console.log("Successfully generated and saved image:", uploadedImageUrl);
      return uploadedImageUrl;
    } catch (error) {
      console.warn("Error generating and saving image:", error);
      // For now, let's create a placeholder image URL for testing
      const placeholderImageUrl = `/generated_placeholder.png`;
      await updatePropWithImage(userId, propId, placeholderImageUrl);
      return placeholderImageUrl;
    }
  };

  // Helper function to proxy Firebase Storage URLs
  const getProxiedImageUrl = (imageUrl: string): string => {
    // Proxy any absolute URL to avoid CORS issues
    if (!imageUrl) return imageUrl;
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
    }
    return imageUrl; // already relative (e.g., from our API)
  };

  // Function to get proxied URL for preview generation
  const getProxiedUrlForPreview = (imageUrl: string): string => {
    if (!imageUrl) return imageUrl;
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
    }
    return imageUrl;
  };

  // Helper function to convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Function to generate preview image locally
  const generatePreviewImage = async (uploadedAssets: any) => {
    try {
      console.log("Generating preview image with assets:", uploadedAssets);

      // Create a canvas to composite the images
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Could not get canvas context");
      }

      // Set canvas size to match template preview (5:4 aspect ratio) - reduced size to fit container
      canvas.width = 480;
      canvas.height = 384;

      // Load background image
      const backgroundImg = new Image();
      backgroundImg.crossOrigin = "anonymous";

      backgroundImg.onload = () => {
        // Draw background
        ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);

        // Load props image (main illustration)
        const propsImg = new Image();
        propsImg.crossOrigin = "anonymous";

        propsImg.onload = () => {
          // Draw props image on top of background, positioned at bottom
          ctx.drawImage(propsImg, 0, 0, canvas.width, canvas.height);

          // Load logo image
          const logoImg = new Image();
          logoImg.crossOrigin = "anonymous";

          logoImg.onload = () => {
            // Draw logo in top-left corner (32px height, 200px width area) - scaled down
            const logoHeight = 32;
            const logoWidth = Math.min(
              200,
              logoImg.width * (logoHeight / logoImg.height)
            );
            ctx.drawImage(logoImg, 16, 16, logoWidth, logoHeight);

            // Add title text in top-right (16px font, right-aligned) - scaled down
            ctx.fillStyle = "black";
            ctx.font = "bold 16px Poppins";
            ctx.textAlign = "right";
            ctx.fillText(propsTitle || "Title", canvas.width - 16, 32);

            // Draw white header background with border
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, 48); // Increased height from 40 to 48
            ctx.strokeStyle = "#E5E7EB"; // Light gray border
            ctx.lineWidth = 1;
            ctx.strokeRect(0, 47, canvas.width, 1); // Bottom border at 47

            // Redraw logo on top of white background
            if (logoUrl) {
              ctx.drawImage(logoImg, 16, 12, logoWidth, logoHeight); // Adjusted Y position from 8 to 12
            }

            // Redraw title text on top of white background
            ctx.fillStyle = "black";
            ctx.font = "16px Poppins"; // Removed bold styling
            ctx.textAlign = "right";
            ctx.fillText(propsTitle || "Title", canvas.width - 16, 36); // Adjusted Y position from 32 to 36

            // Add message box in top-left (gradient background like template) - scaled down
            const messageBoxY = 74; // Reduced from 92 to fit smaller canvas

            // Calculate text content and measure dimensions
            const textLines: string[] = [];
            let maxTextWidth = 0;

            // Add From name line
            if (fromName) {
              const fromText = `From: ${fromName}`;
              textLines.push(fromText);
              maxTextWidth = Math.max(
                maxTextWidth,
                ctx.measureText(fromText).width
              );
            }

            // Add date line
            if (fromDate) {
              const [year, month, day] = fromDate.split("-");
              const formattedDate = `${month}/${day}/${year.slice(2)}`;
              textLines.push(formattedDate);
              maxTextWidth = Math.max(
                maxTextWidth,
                ctx.measureText(formattedDate).width
              );
            }

            // Handle message text with word wrapping
            if (fromMessage) {
              const words = fromMessage.split(" ");
              let currentLine = "";
              const maxWidth = 320; // Reduced from 400 to fit smaller canvas

              for (let i = 0; i < words.length; i++) {
                const testLine =
                  currentLine + (currentLine ? " " : "") + words[i];
                const testWidth = ctx.measureText(testLine).width;

                if (testWidth <= maxWidth) {
                  currentLine = testLine;
                } else {
                  if (currentLine) {
                    textLines.push(currentLine);
                    maxTextWidth = Math.max(
                      maxTextWidth,
                      ctx.measureText(currentLine).width
                    );
                    currentLine = words[i];
                  } else {
                    // Single word is too long, add it anyway
                    textLines.push(words[i]);
                    maxTextWidth = Math.max(
                      maxTextWidth,
                      ctx.measureText(words[i]).width
                    );
                  }
                }
              }

              // Add the last line
              if (currentLine) {
                textLines.push(currentLine);
                maxTextWidth = Math.max(
                  maxTextWidth,
                  ctx.measureText(currentLine).width
                );
              }
            }

            // Calculate box dimensions based on text content
            const padding = 16; // Reduced padding from 20 to 16
            const lineHeight = 16; // Reduced line height from 20 to 16
            const boxWidth = Math.min(maxTextWidth + padding * 2, 400); // Max width reduced from 500 to 400
            const boxHeight = textLines.length * lineHeight + padding;

            // Create gradient background - auto-sized based on text
            const gradient = ctx.createLinearGradient(
              16, // Reduced from 20 to 16
              messageBoxY,
              16 + boxWidth,
              messageBoxY
            );
            gradient.addColorStop(0, "#ADAFBE");
            gradient.addColorStop(0.5, "#4F7295");
            gradient.addColorStop(1, "#ADAFBE");

            ctx.fillStyle = gradient;
            ctx.globalAlpha = 0.8;
            ctx.fillRect(16, messageBoxY, boxWidth, boxHeight); // Reduced x position from 20 to 16
            ctx.globalAlpha = 1.0;

            // Add text inside message box
            ctx.fillStyle = "white";
            ctx.font = "12px Poppins"; // Reduced font size from 14px to 12px
            ctx.textAlign = "left";

            // Draw all text lines
            textLines.forEach((line, index) => {
              ctx.fillText(
                line,
                24, // Reduced from 30 to 24
                messageBoxY + padding + index * lineHeight
              );
            });

            // Convert canvas to data URL
            const previewDataUrl = canvas.toDataURL("image/png");
            setPreviewImageUrl(previewDataUrl);
            console.log("Preview image generated:", previewDataUrl);
          };

          logoImg.onerror = () => {
            console.warn("Could not load logo image, continuing without it");
            // Continue without logo
            const previewDataUrl = canvas.toDataURL("image/png");
            setPreviewImageUrl(previewDataUrl);
          };

          // Set logo source
          const logoUrl =
            uploadedAssets.logoUrl || selectedTemplate?.achievement?.logoImage;
          if (logoUrl) {
            logoImg.src = getProxiedUrlForPreview(logoUrl);
          } else {
            // No logo, continue without it
            const previewDataUrl = canvas.toDataURL("image/png");
            setPreviewImageUrl(previewDataUrl);
          }
        };

        propsImg.onerror = () => {
          console.warn("Could not load props image, continuing without it");
          // Continue without props image
          const previewDataUrl = canvas.toDataURL("image/png");
          setPreviewImageUrl(previewDataUrl);
        };

        // Set props image source
        const propsUrl = selectedTemplate?.achievement?.props;
        if (propsUrl) {
          propsImg.src = getProxiedUrlForPreview(propsUrl);
        } else {
          // No props image, continue without it
          const previewDataUrl = canvas.toDataURL("image/png");
          setPreviewImageUrl(previewDataUrl);
        }
      };

      backgroundImg.onerror = () => {
        console.warn("Could not load background image, using fallback");
        // Use fallback background
        ctx.fillStyle = "#FF69B4"; // Pink background as fallback
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Continue with other elements
        const previewDataUrl = canvas.toDataURL("image/png");
        setPreviewImageUrl(previewDataUrl);
      };

      // Set background image source
      const backgroundUrl =
        uploadedAssets.backgroundUrl ||
        selectedTemplate?.achievement?.backgroundImage;
      if (backgroundUrl) {
        backgroundImg.src = getProxiedUrlForPreview(backgroundUrl);
      } else {
        // No background image, use fallback
        ctx.fillStyle = "#FF69B4"; // Pink background as fallback
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const previewDataUrl = canvas.toDataURL("image/png");
        setPreviewImageUrl(previewDataUrl);
      }
    } catch (error) {
      console.error("Error generating preview image:", error);
      setPreviewImageUrl(null);
    }
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
          ]
            .filter(({ label }) => label !== "Link")
            .map(({ label, bg, icon }, idx) => (
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

        {showLoginNotice && !isLoggedIn && (
          <Link href="/signin" className="font-bold text-[var(--primary-dark)]">
            Please Login To Share Props And Email Receipents
          </Link>
        )}
      </div>
    );
  }

  return (
    <div
      className="h-full flex flex-col"
      style={{ paddingLeft: "8px", paddingRight: "8px" }}
    >
      <div className="text-center flex-shrink-0" style={{ marginTop: "24px" }}>
        <h1 className="text-[30px] font-bold text-white mb-4">Share</h1>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        setIsOpen={setIsAuthModalOpen}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          if (onAuthSuccess) onAuthSuccess();
        }}
      />

      <div className="space-y-4 flex-1 overflow-y-auto">
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
            <label className="flex items-center gap-2 text-sm text-gray-300 mt-2">
              <input
                type="checkbox"
                checked={saveAsTemplate}
                onChange={(e) => setSaveAsTemplate(e.target.checked)}
                className="w-4 h-4 text-[#458CE0] bg-[#1B1D21] border-[#454446] rounded focus:ring-[#458CE0] focus:ring-2 focus:ring-offset-0"
                style={{
                  accentColor: "#458CE0",
                }}
              />
              Save as reusable template
            </label>
            {processStep && (
              <div className="text-[var(--primary-dark)] text-sm mb-2">
                {processStep}
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-500"
                    onClick={async () => {
                      if (!auth.currentUser || !savedPropId) return;
                      setProcessStep("Retrying image generation...");
                      await generateAndSaveImage(
                        auth.currentUser.uid,
                        savedPropId
                      );
                      setProcessStep("");
                    }}
                  >
                    Regenerate Image
                  </button>
                </div>
              </div>
            )}
            <button
              className="w-full bg-[var(--primary-dark)] text-white font-semibold py-2 rounded mb-4 mt-2 hover:bg-[var(--primary)] hover:text-[#191d21] transition"
              onClick={
                !isLoggedIn
                  ? () => setIsAuthModalOpen(true)
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
              {/* Preview Image (Generated Locally) */}
              {previewImageUrl && (
                <div className="mb-4">
                  <h4 className="text-md font-medium text-white mb-2">
                    Preview Image (Generated Locally):
                  </h4>
                  <div className="bg-white rounded-lg p-2 inline-block">
                    <img
                      src={previewImageUrl}
                      alt="Preview Prop"
                      className="w-full h-auto rounded border border-gray-300"
                      style={{ maxWidth: "100%" }}
                      onLoad={() =>
                        console.log("Preview image loaded successfully")
                      }
                      onError={(e) =>
                        console.error("Preview image failed to load:", e)
                      }
                    />
                  </div>
                  {savedPropId && (
                    <div className="mt-2 text-green-400 text-sm">
                      ✓ Preview image saved to database (ID: {savedPropId})
                    </div>
                  )}
                </div>
              )}

              {/* Final Generated Image (From Cloud Function) */}
              {generatedImageUrl && (
                <div className="mb-4">
                  <h4 className="text-md font-medium text-white mb-2">
                    Final Generated Prop Image:
                  </h4>
                  {savedPropId ? (
                    <Link
                      href={`/props/${savedPropId}`}
                      className="bg-white rounded-lg p-2 inline-block"
                      title="View Prop Detail"
                    >
                      <img
                        src={getProxiedImageUrl(generatedImageUrl)}
                        alt="Generated Prop"
                        className="w-64 h-auto rounded border border-gray-300"
                        style={{ maxWidth: "256px" }}
                        onLoad={() =>
                          console.log(
                            "Image loaded successfully:",
                            getProxiedImageUrl(generatedImageUrl)
                          )
                        }
                        onError={(e) =>
                          console.error(
                            "Image failed to load:",
                            getProxiedImageUrl(generatedImageUrl),
                            e
                          )
                        }
                        crossOrigin="anonymous"
                      />
                    </Link>
                  ) : (
                    <div className="bg-white rounded-lg p-2 inline-block">
                      <img
                        src={getProxiedImageUrl(generatedImageUrl)}
                        alt="Generated Prop"
                        className="w-full h-auto rounded border border-gray-300"
                        style={{ maxWidth: "100%" }}
                        onLoad={() =>
                          console.log(
                            "Image loaded successfully:",
                            getProxiedImageUrl(generatedImageUrl)
                          )
                        }
                        onError={(e) =>
                          console.error(
                            "Image failed to load:",
                            getProxiedImageUrl(generatedImageUrl),
                            e
                          )
                        }
                        crossOrigin="anonymous"
                      />
                    </div>
                  )}
                </div>
              )}
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
      <div
        className="flex justify-between flex-shrink-0"
        style={{ marginTop: "12px" }}
      >
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
