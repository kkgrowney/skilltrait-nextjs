# Free Template Duplication Issue - Debug Guide

## Problem Description
Free templates on the Props Detail view show duplicated background images, while company templates display correctly without duplication.

## Root Cause Analysis
- **Company templates** work correctly because they have `previewImageUrl` (Cloudinary URLs) that bypass the fallback rendering
- **Free templates** fall through to the fallback rendering which shows both background and props images layered on top of each other
- The fallback rendering was designed for templates, not generated props, so it shows both images separately

## Solution Implemented
1. **Created `generateTemplatePreviewImage` function** in `src/app/props/[id]/page.tsx` (lines 24-127)
   - Composites background and props images into a single image using HTML5 Canvas
   - Uploads the composite to Cloudinary
   - Similar to how ShareStep component works

2. **Added preview generation logic** in the useEffect (lines 473-487)
   - Generates preview image for free templates that don't have `previewImageUrl` or `previewImageBase64`
   - Only runs if template has both `achievement.backgroundImage` and `achievement.props`

3. **Updated image rendering priority** (lines 521-542)
   - `prop.previewImageUrl` (existing Cloudinary URL)
   - `generatedPreviewUrl` (newly generated composite) ← **This should fix the duplication**
   - `prop.previewImageBase64` (fallback)
   - Layered rendering (last resort)

## Debugging Steps
To verify the fix is working, check the browser console for these messages:

1. **"Prop data for preview generation:"** - Shows if template has required data
2. **"Generating template preview image..."** - Shows if generation is starting
3. **"Background image loaded successfully"** - Shows if background image loads
4. **"Props image loaded successfully"** - Shows if props image loads
5. **"Generated preview URL:"** - Shows the final Cloudinary URL
6. **"Image rendering decision:"** - Shows which rendering path is used

## Files Modified
- `src/app/props/[id]/page.tsx` - Main fix with preview generation
- `src/app/digital-awards-generator/ClientPage.tsx` - CORS fixes
- `src/components/digital-awards/BackgroundStep.tsx` - CORS fixes
- `src/components/DigitalAwardsView.tsx` - CORS fixes
- `src/app/home/page.tsx` - CORS fixes

## Expected Behavior
- Free templates should now use the generated composite image (single image)
- No more layered background + props images
- Should match company template behavior

## If Issue Persists
1. Check console for debugging messages
2. Verify the template has `achievement.backgroundImage` and `achievement.props`
3. Check if `generateTemplatePreviewImage` is being called
4. Verify the generated URL is being used in rendering
5. Check for any CORS errors preventing image loading

## Test Cases
- Navigate to Props Detail view of any free template
- Should see single composite image (no duplication)
- Console should show successful preview generation
- Should match company template appearance

## Code Location
Main fix is in `src/app/props/[id]/page.tsx`:
- Lines 24-127: `generateTemplatePreviewImage` function
- Lines 473-487: Preview generation logic in useEffect
- Lines 521-542: Updated image rendering priority
