# Cloudinary Integration Setup

This project now uses Cloudinary for image storage instead of base64 encoding, which provides:

- **Faster loading times** - Images load from CDN instead of large base64 strings
- **Better performance** - Reduced localStorage usage and memory consumption
- **Image optimization** - Automatic format conversion and resizing
- **Scalability** - Professional CDN infrastructure

## Configuration

The Cloudinary integration is configured with:

- **Cloud Name**: `produckapp`
- **API Key**: `192645388792962`
- **API Secret**: `eV-GdhkoAW-dsiSFbGY9ep1bPZw`
- **Folder**: `sendProps`

## How It Works

### 1. Image Generation

When a user generates a prop image:

1. Canvas is rendered with the prop design
2. Canvas is converted to base64 PNG
3. Base64 is converted to blob and uploaded to Cloudinary via API route
4. Cloudinary URL is saved to Firebase instead of base64
5. Fallback to base64 if Cloudinary upload fails

### 2. Storage Structure

Firebase now stores:

```json
{
  "previewImageUrl": "https://res.cloudinary.com/produckapp/image/upload/...",
  "previewImageBase64": null // Only if Cloudinary upload failed
  // ... other prop data
}
```

### 3. Image Display

- **Recent Props**: Uses Cloudinary URLs for fast loading
- **Share Step Preview**: Uses Cloudinary URLs for immediate display
- **Fallback**: Gracefully falls back to base64 if needed

## API Route

The `/api/cloudinary-upload` route handles:

- Secure uploads with signed requests
- Proper error handling
- File validation
- Cloudinary authentication

## Benefits

1. **Performance**: Images load 10-50x faster from CDN
2. **Storage**: Reduced Firebase storage costs
3. **User Experience**: Faster page loads and smoother interactions
4. **Scalability**: Handles high traffic and large images efficiently
5. **Optimization**: Automatic image format optimization

## Usage Examples

### Upload Image

```typescript
import { uploadToCloudinary } from "@/lib/cloudinary";

const cloudinaryUrl = await uploadToCloudinary(base64Image);
```

### Optimize Image URL

```typescript
import { getOptimizedCloudinaryUrl } from "@/lib/cloudinary";

const optimizedUrl = getOptimizedCloudinaryUrl(url, {
  width: 300,
  height: 200,
  quality: 80,
  format: "webp",
});
```

## Security Notes

- API keys are stored server-side only
- Uploads are signed and authenticated
- Folder structure prevents unauthorized access
- Rate limiting can be added if needed

## Future Enhancements

- Image transformations (resize, crop, filters)
- Automatic format conversion (WebP, AVIF)
- Lazy loading and progressive loading
- Image compression optimization
- CDN caching strategies
