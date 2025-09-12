"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import {
  saveUserProp,
  uploadAsset,
  createTemplateWithAssets,
  savePropWithImage,
  updatePropWithImage,
  saveUserTemplateAssets,
  savePublicProp,
} from "@/lib/firebase";
import Link from "next/link";
import AuthModal from "./AuthModal";
import { uploadToCloudinary } from "@/lib/cloudinary";
import toast from "react-hot-toast";

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
  const router = useRouter();
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

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });

    return () => unsubscribe();
  }, []);

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

      // Step 2: Generate preview image and upload to Cloudinary
      setProcessStep("Generating preview image and uploading to cloud");
      const previewResult = await generatePreviewImage(uploadedAssets);

      // Step 3: Save the preview image to database
      setProcessStep("Saving preview image to database...");

      // Get the preview image result (Cloudinary URL or base64 fallback)
      const cloudinaryUrl = previewResult?.startsWith("http")
        ? previewResult
        : null;
      const savedPreviewImage = previewResult?.startsWith("http")
        ? null
        : previewResult;

      console.log(
        "Retrieved preview image result:",
        cloudinaryUrl ? "Cloudinary URL" : "Base64",
        cloudinaryUrl || savedPreviewImage
      );

      // Log the uploaded assets for debugging
      console.log("Uploaded assets for preview:", uploadedAssets);
      console.log("Selected template:", selectedTemplate);
      console.log("Preview image URL:", previewImageUrl);
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
          previewImageUrl: cloudinaryUrl || null, // Save Cloudinary URL
          previewImageBase64: cloudinaryUrl ? null : savedPreviewImage || "", // Fallback to base64 if no Cloudinary URL
          isPublic: true, // Make prop publicly shareable
          userDisplayName: (user as any).display_name || user.displayName || "", // Store user's display name for sharing
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const propId = await saveUserProp(user.uid, propData);
        setSavedPropId(propId);
        console.log("Preview image saved to database with prop ID:", propId);
        setProcessStep("Preview image saved successfully!");

        // Also save to public collection for sharing
        try {
          await savePublicProp(propId, propData);
          console.log("Prop saved to public collection for sharing");
        } catch (error) {
          console.error("Error saving to public collection:", error);
          // Don't fail the whole process if public save fails
        }

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
          localStorage.removeItem("temp-preview-image-base64"); // Clean up temporary preview image
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

  // Step 2: Create template in user subcollection (no prop saving)
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

      // Return the user template ID (no prop saving here - that's done in the main function)
      return userTemplateId;
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
  const generatePreviewImage = async (uploadedAssets: any): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log("Generating preview image with assets:", uploadedAssets);

        // Create a canvas to composite the images
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("Could not get canvas context");
        }

        // Set canvas size to match prop detail page (full image without aspect ratio constraint)
        canvas.width = 600;
        canvas.height = 480;

        // Load background image
        const backgroundImg = new Image();
        backgroundImg.crossOrigin = "anonymous";

        backgroundImg.onload = () => {
          // Draw background with object-fit: cover behavior to prevent distortion
          const canvasAspectRatio = canvas.width / canvas.height;
          const imageAspectRatio = backgroundImg.width / backgroundImg.height;

          let drawWidth, drawHeight, drawX, drawY;

          if (imageAspectRatio > canvasAspectRatio) {
            // Image is wider than canvas - fit to height, crop width
            drawHeight = canvas.height;
            drawWidth =
              backgroundImg.width * (canvas.height / backgroundImg.height);
            drawX = (canvas.width - drawWidth) / 2;
            drawY = 0;
          } else {
            // Image is taller than canvas - fit to width, crop height
            drawWidth = canvas.width;
            drawHeight =
              backgroundImg.height * (canvas.width / backgroundImg.width);
            drawX = 0;
            drawY = (canvas.height - drawHeight) / 2;
          }

          ctx.drawImage(backgroundImg, drawX, drawY, drawWidth, drawHeight);

          // Load props image (main illustration)
          const propsImg = new Image();
          propsImg.crossOrigin = "anonymous";

          propsImg.onload = () => {
            // Draw props image on top of background with object-fit: cover behavior
            const canvasAspectRatio = canvas.width / canvas.height;
            const imageAspectRatio = propsImg.width / propsImg.height;

            let drawWidth, drawHeight, drawX, drawY;

            if (imageAspectRatio > canvasAspectRatio) {
              // Image is wider than canvas - fit to height, crop width
              drawHeight = canvas.height;
              drawWidth = propsImg.width * (canvas.height / propsImg.height);
              drawX = (canvas.width - drawWidth) / 2;
              drawY = 0;
            } else {
              // Image is taller than canvas - fit to width, crop height
              drawWidth = canvas.width;
              drawHeight = propsImg.height * (canvas.width / propsImg.width);
              drawX = 0;
              drawY = (canvas.height - drawHeight) / 2;
            }

            ctx.drawImage(propsImg, drawX, drawY, drawWidth, drawHeight);

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

              // Draw white header background with border - increased to 80px height
              ctx.fillStyle = "white";
              ctx.fillRect(0, 0, canvas.width, 80); // 80px height
              ctx.strokeStyle = "#E4E4E4"; // Same border color as prop detail page
              ctx.lineWidth = 1;
              ctx.strokeRect(0, 79, canvas.width, 1); // Bottom border at 79

              // Redraw logo on top of white background - adjusted for 80px header
              if (logoUrl) {
                const logoHeight = 50; // Increased height for larger header
                const logoWidth = Math.min(
                  300, // Increased max width for larger header
                  logoImg.width * (logoHeight / logoImg.height)
                );
                ctx.drawImage(logoImg, 16, 15, logoWidth, logoHeight); // Adjusted Y position
              }

              // Redraw title text on top of white background - adjusted for 80px header
              ctx.fillStyle = "black";
              ctx.font = "24px Poppins"; // Increased font size for larger header
              ctx.textAlign = "right";
              ctx.fillText(propsTitle || "Title", canvas.width - 16, 52); // Adjusted Y position

              // Add Skilltrait branding at bottom right corner with top-left border rounded
              ctx.fillStyle = "rgba(0, 0, 0, 0.4)"; // Decreased opacity background
              ctx.font = "10px Poppins"; // Reduced font size
              ctx.textAlign = "center"; // Center align text

              // Create rounded rectangle for Skilltrait branding
              const skilltraitText = "@Skilltrait";
              const skilltraitTextWidth = ctx.measureText(skilltraitText).width;
              const skilltraitPadding = 12; // Increased padding
              const skilltraitWidth =
                skilltraitTextWidth + skilltraitPadding * 2;
              const skilltraitHeight = 24; // Increased height for more padding
              const skilltraitX = canvas.width - skilltraitWidth; // Joint to right edge
              const skilltraitY = canvas.height - skilltraitHeight; // Joint to bottom edge

              // Draw rounded rectangle with top-left border radius
              ctx.beginPath();
              ctx.moveTo(skilltraitX + 8, skilltraitY); // Top-left rounded corner
              ctx.lineTo(skilltraitX + skilltraitWidth, skilltraitY);
              ctx.lineTo(
                skilltraitX + skilltraitWidth,
                skilltraitY + skilltraitHeight
              );
              ctx.lineTo(skilltraitX, skilltraitY + skilltraitHeight);
              ctx.lineTo(skilltraitX, skilltraitY + 8);
              ctx.quadraticCurveTo(
                skilltraitX,
                skilltraitY,
                skilltraitX + 8,
                skilltraitY
              );
              ctx.closePath();
              ctx.fill();

              // Add Skilltrait text centered in the tag
              ctx.fillStyle = "white";
              ctx.fillText(
                skilltraitText,
                skilltraitX + skilltraitWidth / 2,
                skilltraitY + 16 // Adjusted for new height
              );

              // Helper function to draw rounded rectangle with proper border radius
              const drawRoundedRect = (
                x: number,
                y: number,
                width: number,
                height: number,
                radius: number
              ) => {
                ctx.beginPath();
                ctx.moveTo(x + radius, y);
                ctx.lineTo(x + width - radius, y);
                ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
                ctx.lineTo(x + width, y + height - radius);
                ctx.quadraticCurveTo(
                  x + width,
                  y + height,
                  x + width - radius,
                  y + height
                );
                ctx.lineTo(x + radius, y + height);
                ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
                ctx.lineTo(x, y + radius);
                ctx.quadraticCurveTo(x, y, x + radius, y);
                ctx.closePath();
              };

              const borderRadius = 12; // Tailwind rounded-lg equivalent (12px for better visibility)

              // Add props recipients box first (if any) - matching prop detail page exactly
              let currentY = 90; // Adjusted for 80px header
              const padding = 12; // Reduced from 16 to 12 for smaller canvas
              const lineHeight = 20; // Increased for larger font
              const maxBoxWidth = 296; // Max width like prop detail page
              const availableTextWidth = maxBoxWidth - padding * 2; // Width available for text

              // Draw props recipients box if there are any
              if (propsRecipients && propsRecipients.length > 0) {
                // Handle text wrapping for recipients - FIXED TO USE COMMA SEPARATION
                const recipientsText = propsRecipients.join(", ");
                const recipientsLines: string[] = ["Props recipients:"];

                // Set font for accurate measurement
                ctx.font = "16px Poppins"; // Increased font size

                // Wrap the comma-separated names properly
                const words = recipientsText.split(" ");
                let currentLine = "";
                const maxLineWidth = availableTextWidth;

                for (let i = 0; i < words.length; i++) {
                  const testLine =
                    currentLine + (currentLine ? " " : "") + words[i];
                  const testWidth = ctx.measureText(testLine).width;

                  if (testWidth <= maxLineWidth) {
                    currentLine = testLine;
                  } else {
                    if (currentLine) {
                      recipientsLines.push(currentLine);
                      currentLine = words[i];
                    } else {
                      // Single word is too long, add it anyway
                      recipientsLines.push(words[i]);
                    }
                  }
                }

                // Add the last line
                if (currentLine) {
                  recipientsLines.push(currentLine);
                }

                // Calculate text width for recipients box - auto width with max constraint
                let maxRecipientsTextWidth = 0;
                recipientsLines.forEach((line: string) => {
                  const textWidth = ctx.measureText(line).width;
                  maxRecipientsTextWidth = Math.max(
                    maxRecipientsTextWidth,
                    textWidth
                  );
                });

                // Calculate recipients box width - same width as message box will be
                const recipientsBoxWidth = maxBoxWidth; // Use full max width to match message box

                // Calculate box height for recipients - auto height based on content
                const recipientsBoxHeight = Math.max(
                  recipientsLines.length * lineHeight + padding * 2,
                  lineHeight + padding * 2 // Minimum height for single line
                );

                // Create linear gradient background for recipients box - matching prop-inside-box class exactly
                const recipientsGradient = ctx.createLinearGradient(
                  16,
                  currentY,
                  16 + recipientsBoxWidth,
                  currentY
                );
                recipientsGradient.addColorStop(0, "rgba(173, 175, 190, 0.8)");
                recipientsGradient.addColorStop(0.5, "rgba(79, 114, 149, 0.8)"); // Increased opacity to match CSS
                recipientsGradient.addColorStop(1, "rgba(173, 175, 190, 0.8)");

                ctx.fillStyle = recipientsGradient;
                ctx.globalAlpha = 1.0; // Full opacity to match CSS

                // Draw rounded rectangle for recipients box
                drawRoundedRect(
                  16,
                  currentY,
                  recipientsBoxWidth,
                  recipientsBoxHeight,
                  borderRadius
                );
                ctx.fill();
                ctx.globalAlpha = 1.0;

                // Add recipients text
                ctx.fillStyle = "white";
                ctx.font = "16px Poppins"; // Increased font size
                ctx.textAlign = "left";

                recipientsLines.forEach((line: string, index: number) => {
                  // Add extra spacing between "Props recipients:" and the names
                  const extraSpacing = index === 1 ? 4 : 0; // Reduced extra space
                  ctx.fillText(
                    line,
                    24,
                    currentY + padding + index * lineHeight + 12 + extraSpacing
                  );
                });

                // Move to next position for message box
                currentY += recipientsBoxHeight + 10; // Add spacing between boxes
              }

              // Calculate text content and measure dimensions
              const textLines: string[] = [];
              let maxTextWidth = 0;

              // Set font for measuring
              ctx.font = "16px Poppins"; // Increased font size

              // Add From name (without date on same line)
              let hasFromLine = false;
              if (fromName) {
                const headerLine = `From: ${fromName}`;
                textLines.push(headerLine);
                hasFromLine = true;
                maxTextWidth = Math.max(
                  maxTextWidth,
                  ctx.measureText(headerLine).width
                );
              }

              // Handle message text with word wrapping
              if (fromMessage) {
                const words = fromMessage.split(" ");
                let currentLine = "";
                const maxWidth = availableTextWidth; // Use the actual available width

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

              // Calculate final box dimensions based on actual text content (no extra whitespace)
              const boxWidth = Math.min(
                maxTextWidth + padding * 2,
                maxBoxWidth
              ); // Use max width to match recipients box
              const spacingBetweenSections = hasFromLine && fromMessage ? 8 : 0; // Extra spacing between From and message
              const boxHeight =
                textLines.length * lineHeight +
                padding * 2 +
                spacingBetweenSections; // Added padding to bottom + spacing

              // Create linear gradient background for message box - matching prop-inside-box class exactly
              const messageGradient = ctx.createLinearGradient(
                16,
                currentY,
                16 + maxBoxWidth,
                currentY
              );
              messageGradient.addColorStop(0, "rgba(173, 175, 190, 0.8)");
              messageGradient.addColorStop(0.5, "rgba(79, 114, 149, 0.8)"); // Increased opacity to match CSS
              messageGradient.addColorStop(1, "rgba(173, 175, 190, 0.8)");

              ctx.fillStyle = messageGradient;
              ctx.globalAlpha = 1.0; // Full opacity to match CSS

              // Draw rounded rectangle for message box
              drawRoundedRect(16, currentY, boxWidth, boxHeight, borderRadius);
              ctx.fill();
              ctx.globalAlpha = 1.0;

              // Add text inside message box - matching prop detail page exactly
              ctx.fillStyle = "white";
              ctx.font = "16px Poppins"; // Increased font size
              ctx.textAlign = "left";

              // Draw all text lines with proper spacing
              let textY = currentY + padding + 8; // Starting Y position
              textLines.forEach((line, index) => {
                // Add extra spacing after the "From:" line
                if (index === 1 && hasFromLine) {
                  textY += spacingBetweenSections;
                }

                ctx.fillText(
                  line,
                  24, // Left padding
                  textY
                );
                textY += lineHeight;
              });

              // Draw date at the rightmost position inside the gray box
              if (fromDate) {
                const [year, month, day] = fromDate.split("-");
                const formattedDate = `${month}/${day}/${year.slice(2)}`;
                ctx.textAlign = "right";
                ctx.fillText(
                  formattedDate,
                  16 + boxWidth - padding, // Right edge minus padding
                  currentY + padding + 8 // Same Y as first line with offset
                );
                ctx.textAlign = "left"; // Reset to left alignment
              }

              // Convert canvas to data URL and upload to Cloudinary
              const previewDataUrl = canvas.toDataURL("image/png");

              // Use a separate async function to handle the upload
              const handleMainUpload = async () => {
                try {
                  // Upload to Cloudinary
                  const cloudinaryUrl = await uploadToCloudinary(
                    previewDataUrl
                  );
                  setPreviewImageUrl(cloudinaryUrl);

                  // Save Cloudinary URL to localStorage for immediate access
                  localStorage.setItem("temp-preview-image-url", cloudinaryUrl);
                  console.log(
                    "Preview image uploaded to Cloudinary:",
                    cloudinaryUrl
                  );

                  // Resolve the promise with the Cloudinary URL
                  resolve(cloudinaryUrl);
                } catch (error) {
                  console.error(
                    "Failed to upload to Cloudinary, falling back to base64:",
                    error
                  );
                  // Fallback to base64 if Cloudinary upload fails
                  setPreviewImageUrl(previewDataUrl);
                  localStorage.setItem(
                    "temp-preview-image-base64",
                    previewDataUrl
                  );

                  // Resolve the promise with the base64 fallback
                  resolve(previewDataUrl);
                }
              };

              handleMainUpload();
            };

            logoImg.onerror = async () => {
              console.warn("Could not load logo image, continuing without it");
              // Continue without logo
              const previewDataUrl = canvas.toDataURL("image/png");

              try {
                const cloudinaryUrl = await uploadToCloudinary(previewDataUrl);
                setPreviewImageUrl(cloudinaryUrl);
                localStorage.setItem("temp-preview-image-url", cloudinaryUrl);
                resolve(cloudinaryUrl);
              } catch (error) {
                setPreviewImageUrl(previewDataUrl);
                localStorage.setItem(
                  "temp-preview-image-base64",
                  previewDataUrl
                );
                resolve(previewDataUrl);
              }
            };

            // Set logo source
            const logoUrl =
              uploadedAssets.logoUrl ||
              selectedTemplate?.achievement?.logoImage;
            if (logoUrl) {
              logoImg.src = getProxiedUrlForPreview(logoUrl);
            } else {
              // No logo, continue without it
              const previewDataUrl = canvas.toDataURL("image/png");

              // Use a separate async function to handle the upload
              const handleNoLogoUpload = async () => {
                try {
                  const cloudinaryUrl = await uploadToCloudinary(
                    previewDataUrl
                  );
                  setPreviewImageUrl(cloudinaryUrl);
                  localStorage.setItem("temp-preview-image-url", cloudinaryUrl);
                  resolve(cloudinaryUrl);
                } catch (error) {
                  setPreviewImageUrl(previewDataUrl);
                  localStorage.setItem(
                    "temp-preview-image-base64",
                    previewDataUrl
                  );
                  resolve(previewDataUrl);
                }
              };

              handleNoLogoUpload();
            }
          };

          propsImg.onerror = () => {
            console.warn("Could not load props image, continuing without it");
            // Continue without props image
            const previewDataUrl = canvas.toDataURL("image/png");

            // Use a separate async function to handle the upload
            const handlePropsErrorUpload = async () => {
              try {
                const cloudinaryUrl = await uploadToCloudinary(previewDataUrl);
                setPreviewImageUrl(cloudinaryUrl);
                localStorage.setItem("temp-preview-image-url", cloudinaryUrl);
                resolve(cloudinaryUrl);
              } catch (error) {
                setPreviewImageUrl(previewDataUrl);
                localStorage.setItem(
                  "temp-preview-image-base64",
                  previewDataUrl
                );
                resolve(previewDataUrl);
              }
            };

            handlePropsErrorUpload();
          };

          // Set props image source
          const propsUrl = selectedTemplate?.achievement?.props;
          if (propsUrl) {
            propsImg.src = getProxiedUrlForPreview(propsUrl);
          } else {
            // No props image, continue without it
            const previewDataUrl = canvas.toDataURL("image/png");

            // Use a separate async function to handle the upload
            const handleNoPropsUpload = async () => {
              try {
                const cloudinaryUrl = await uploadToCloudinary(previewDataUrl);
                setPreviewImageUrl(cloudinaryUrl);
                localStorage.setItem("temp-preview-image-url", cloudinaryUrl);
                resolve(cloudinaryUrl);
              } catch (error) {
                setPreviewImageUrl(previewDataUrl);
                localStorage.setItem(
                  "temp-preview-image-base64",
                  previewDataUrl
                );
                resolve(previewDataUrl);
              }
            };

            handleNoPropsUpload();
          }
        };

        backgroundImg.onerror = () => {
          console.warn("Could not load background image, using fallback");
          // Use fallback background
          ctx.fillStyle = "#FF69B4"; // Pink background as fallback
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Continue with other elements
          const previewDataUrl = canvas.toDataURL("image/png");

          // Use a separate async function to handle the upload
          const handleBackgroundErrorUpload = async () => {
            try {
              const cloudinaryUrl = await uploadToCloudinary(previewDataUrl);
              setPreviewImageUrl(cloudinaryUrl);
              localStorage.setItem("temp-preview-image-url", cloudinaryUrl);
              resolve(cloudinaryUrl);
            } catch (error) {
              setPreviewImageUrl(previewDataUrl);
              localStorage.setItem("temp-preview-image-base64", previewDataUrl);
              resolve(previewDataUrl);
            }
          };

          handleBackgroundErrorUpload();
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

          try {
            const cloudinaryUrl = await uploadToCloudinary(previewDataUrl);
            setPreviewImageUrl(cloudinaryUrl);
            localStorage.setItem("temp-preview-image-url", cloudinaryUrl);
            resolve(cloudinaryUrl);
          } catch (error) {
            setPreviewImageUrl(previewDataUrl);
            localStorage.setItem("temp-preview-image-base64", previewDataUrl);
            resolve(previewDataUrl);
          }
        }

        backgroundImg.onerror = () => {
          console.warn("Could not load background image, using fallback");
          // Use fallback background
          ctx.fillStyle = "#FF69B4"; // Pink background as fallback
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Continue with other elements
          const previewDataUrl = canvas.toDataURL("image/png");

          // Use a separate async function to handle the upload
          const handleBackgroundErrorUpload2 = async () => {
            try {
              const cloudinaryUrl = await uploadToCloudinary(previewDataUrl);
              setPreviewImageUrl(cloudinaryUrl);
              localStorage.setItem("temp-preview-image-url", cloudinaryUrl);
              resolve(cloudinaryUrl);
            } catch (error) {
              setPreviewImageUrl(previewDataUrl);
              localStorage.setItem("temp-preview-image-base64", previewDataUrl);
              resolve(previewDataUrl);
            }
          };

          handleBackgroundErrorUpload2();
        };

        // Set background image source
        if (backgroundUrl) {
          backgroundImg.src = getProxiedUrlForPreview(backgroundUrl);
        } else {
          // No background image, use fallback
          ctx.fillStyle = "#FF69B4"; // Pink background as fallback
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          const previewDataUrl = canvas.toDataURL("image/png");

          // Use a separate async function to handle the upload
          const handleNoBackgroundUpload = async () => {
            try {
              const cloudinaryUrl = await uploadToCloudinary(previewDataUrl);
              setPreviewImageUrl(cloudinaryUrl);
              localStorage.setItem("temp-preview-image-url", cloudinaryUrl);
              resolve(cloudinaryUrl);
            } catch (error) {
              setPreviewImageUrl(previewDataUrl);
              localStorage.setItem("temp-preview-image-base64", previewDataUrl);
              resolve(previewDataUrl);
            }
          };

          handleNoBackgroundUpload();
        }
      } catch (error) {
        console.error("Error generating preview image:", error);
        setPreviewImageUrl(null);
        reject(error);
      }
    });
  };

  const handleShare = () => {
    if (savedPropId) {
      router.push(`/props/${savedPropId}`);
    } else {
      console.error("No saved prop ID available");
      alert("Error: Prop not found. Please try generating again.");
    }
  };

  return (
    <div
      className="h-full flex flex-col"
      style={{ paddingLeft: "8px", paddingRight: "8px" }}
    >
      <div className="text-center flex-shrink-0" style={{ marginTop: "24px" }}>
        <h1 className="text-[30px] font-bold text-white mb-4">Save</h1>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        setIsOpen={setIsAuthModalOpen}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          if (onAuthSuccess) {
            toast.success(
              "✅ Login successful! Click Generate & Save to create prop."
            );

            onAuthSuccess();
          }
        }}
      />

      <div className="space-y-4 flex-1 overflow-y-auto">
        {!generatedAward ? (
          <div
            className="p-4 rounded-sm border"
            style={{ backgroundColor: "#1B1D21", borderColor: "#454446" }}
          >
            <h3 className="text-lg font-medium text-white mb-2">
              Generate and Save
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
                  ✓ Award saved successfully!
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
                      className="rounded border border-gray-300"
                      style={{
                        width: "247px",
                        height: "197px",
                        objectFit: "cover",
                        objectPosition: "center",
                      }}
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
                      ✓ Preview image saved to database
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
                        className="rounded border border-gray-300"
                        style={{
                          width: "247px",
                          height: "197px",
                          objectFit: "cover",
                          objectPosition: "center",
                        }}
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
                        className="rounded border border-gray-300"
                        style={{
                          width: "247px",
                          height: "197px",
                          objectFit: "cover",
                          objectPosition: "center",
                        }}
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
                onClick={handleShare}
                className="w-full px-4 py-2 text-sm font-medium transition-colors bg-[var(--primary-dark)] text-[#212327] rounded hover:bg-[#0AFB84]"
              >
                View Prop
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div
        className="flex justify-between flex-shrink-0"
        style={{ marginTop: "12px", padding: "20px" }}
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
