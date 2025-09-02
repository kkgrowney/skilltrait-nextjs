// Cloudinary configuration and utilities
export const CLOUDINARY_CONFIG = {
  cloudName: "produckapp",
  folder: "sendProps",
};

// Function to upload image to Cloudinary via our API route
export const uploadToCloudinary = async (
  base64Image: string
): Promise<string> => {
  try {
    // Convert base64 to blob
    const base64Data = base64Image.split(",")[1];
    const blob = await fetch(`data:image/png;base64,${base64Data}`).then(
      (res) => res.blob()
    );

    // Create FormData for our API
    const formData = new FormData();
    formData.append("file", blob, "prop-image.png");

    // Upload via our API route
    const response = await fetch("/api/cloudinary-upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload to Cloudinary");
    }

    const result = await response.json();
    return result.url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};

// Function to get optimized Cloudinary URL with transformations
export const getOptimizedCloudinaryUrl = (
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "auto" | "webp" | "png" | "jpg";
  } = {}
) => {
  if (!url || !url.includes("cloudinary.com")) {
    return url;
  }

  const { width, height, quality = "auto", format = "auto" } = options;

  // Parse the Cloudinary URL
  const urlParts = url.split("/upload/");
  if (urlParts.length !== 2) return url;

  const baseUrl = urlParts[0] + "/upload";
  const imagePath = urlParts[1];

  // Build transformation parameters
  const transformations = [];
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (quality !== "auto") transformations.push(`q_${quality}`);
  if (format !== "auto") transformations.push(`f_${format}`);

  const transformationString =
    transformations.length > 0 ? transformations.join(",") + "/" : "";

  return `${baseUrl}/${transformationString}${imagePath}`;
};
