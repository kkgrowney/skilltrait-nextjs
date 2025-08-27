/**
 * Utility functions for downloading high-resolution PNG images
 * Can be reused across different components that need download functionality
 */

export interface DownloadOptions {
  width?: number;
  height?: number;
  quality?: number;
  filename?: string;
}

/**
 * Downloads an image as a high-resolution PNG
 * @param imageUrl - URL of the image to download
 * @param options - Download configuration options
 */
export const downloadImageAsPNG = async (
  imageUrl: string,
  options: DownloadOptions = {}
): Promise<void> => {
  const {
    width = 1500,
    height = 1200,
    quality = 1.0,
    filename = `download-${Date.now()}.png`
  } = options;

  return new Promise((resolve, reject) => {
    try {
      // Create a canvas element
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Set canvas dimensions for high resolution
      canvas.width = width;
      canvas.height = height;

      // Create a temporary image to load the source
      const img = new Image();
      img.crossOrigin = 'anonymous';

      // Add timeout to prevent hanging
      const timeout = setTimeout(() => {
        reject(new Error('Image load timeout'));
      }, 10000); // 10 second timeout

      img.onload = () => {
        clearTimeout(timeout);
        try {
          // Draw the image at high resolution
          ctx.drawImage(img, 0, 0, width, height);

          // Trigger download
          const link = document.createElement('a');
          link.download = filename;
          link.href = canvas.toDataURL('image/png', quality);
          link.click();
          
          resolve();
        } catch (error) {
          reject(new Error(`Failed to process image: ${error.message}`));
        }
      };

      img.onerror = () => {
        clearTimeout(timeout);
        console.error('Failed to load image:', imageUrl);
        reject(new Error(`Failed to load image: ${imageUrl}`));
      };

      img.src = imageUrl;

    } catch (error) {
      reject(new Error(`Setup error: ${error.message}`));
    }
  });
};

/**
 * Downloads a prop image as a high-resolution PNG
 * @param propImageUrl - URL of the prop image
 * @param propsTitle - Title of the prop for filename
 */
export const downloadPropAsPNG = async (
  propImageUrl: string,
  propsTitle?: string
): Promise<void> => {
  try {
    const filename = `${propsTitle || 'prop'}-${Date.now()}.png`;
    
    await downloadImageAsPNG(propImageUrl, {
      width: 1500,
      height: 1200,
      quality: 1.0,
      filename
    });
  } catch (error) {
    console.error('Error downloading prop:', error);
    throw error;
  }
};

/**
 * Downloads a template image as a high-resolution PNG
 * @param templateImageUrl - URL of the template image
 * @param companyName - Company name for filename
 */
export const downloadTemplateAsPNG = async (
  templateImageUrl: string,
  companyName?: string
): Promise<void> => {
  try {
    const filename = `${companyName || 'template'}-${Date.now()}.png`;
    
    await downloadImageAsPNG(templateImageUrl, {
      width: 1000,
      height: 800,
      quality: 1.0,
      filename
    });
  } catch (error) {
    console.error('Error downloading template:', error);
    throw error;
  }
};

/**
 * Downloads a custom image with specific dimensions
 * @param imageUrl - URL of the image
 * @param width - Desired width
 * @param height - Desired height
 * @param filename - Custom filename
 */
export const downloadCustomImageAsPNG = async (
  imageUrl: string,
  width: number,
  height: number,
  filename?: string
): Promise<void> => {
  try {
    const finalFilename = filename || `custom-${width}x${height}-${Date.now()}.png`;
    
    await downloadImageAsPNG(imageUrl, {
      width,
      height,
      quality: 1.0,
      filename: finalFilename
    });
  } catch (error) {
    console.error('Error downloading custom image:', error);
    throw error;
  }
};

/**
 * Fallback download function that downloads the original image directly
 * Use this when the canvas approach fails
 */
export const downloadImageDirectly = async (
  imageUrl: string,
  filename?: string
): Promise<void> => {
  try {
    const finalFilename = filename || `image-${Date.now()}.png`;
    
    // For Firebase Storage URLs, use direct download approach
    if (imageUrl.includes('firebasestorage.googleapis.com')) {
      try {
        const link = document.createElement('a');
        link.download = finalFilename;
        link.href = imageUrl;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      } catch (error) {
        console.error('Firebase direct download failed:', error);
        // Continue to fallback methods
      }
    }
    
    // For other URLs, try direct download first
    try {
      const link = document.createElement('a');
      link.download = finalFilename;
      link.href = imageUrl;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Direct download failed, trying alternative method:', error);
      
      // Alternative: open in new tab as last resort
      window.open(imageUrl, '_blank');
    }
    
  } catch (error) {
    console.error('Error downloading image directly:', error);
    throw error;
  }
};

/**
 * Optimized download function specifically for Firebase Storage URLs
 * This bypasses canvas issues and downloads directly from Firebase
 */
export const downloadFirebaseImage = async (
  firebaseUrl: string,
  filename?: string
): Promise<void> => {
  try {
    const finalFilename = filename || `firebase-image-${Date.now()}.png`;
    
    // Since Firebase Storage URLs don't support direct download due to CORS,
    // we'll open the image in a new tab with download instructions
    const newWindow = window.open(firebaseUrl, '_blank');
    
    if (newWindow) {
      // Add a message to the new window
      setTimeout(() => {
        try {
          newWindow.document.title = `Download: ${finalFilename}`;
          newWindow.document.body.innerHTML = `
            <div style="text-align: center; padding: 40px; font-family: Arial, sans-serif;">
              <h2>Download Your Image</h2>
              <p>To download this image:</p>
              <ol style="text-align: left; display: inline-block;">
                <li>Right-click on the image below</li>
                <li>Select "Save image as..."</li>
                <li>Choose your download location</li>
                <li>Save as: <strong>${finalFilename}</strong></li>
              </ol>
              <br><br>
              <img src="${firebaseUrl}" alt="Downloadable Image" style="max-width: 100%; border: 1px solid #ccc;">
            </div>
          `;
        } catch (e) {
          // If we can't modify the new window, just let it open normally
          console.log('Could not modify new window, opened Firebase URL directly');
        }
      }, 100);
    }
    
  } catch (error) {
    console.error('Error opening Firebase image:', error);
    throw error;
  }
};
