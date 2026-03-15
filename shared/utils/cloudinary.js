/**
 * Utility to apply Cloudinary transformations, specifically watermarks.
 */

export const applyWatermark = (url, watermarkId, enabled = false) => {
  if (!url || !url.includes('cloudinary.com')) return url;
  if (!enabled || !watermarkId) return url;

  // Cloudinary public IDs can have folders represented by / which should be : in transformation
  // Also, we escape URI components in case of spaces (though underscores are preferred)
  const safeId = watermarkId.toString().replace(/\//g, ':');
  
  // Refined transformation string using fl_layer_apply for maximum compatibility
  // Positioned at center (g_center) with 50% opacity for better visibility without hiding details
  const watermarkTransform = `l_${safeId}/c_scale,w_300/fl_layer_apply,g_center,o_50`;
  
  if (url.includes('/upload/')) {
    const finalUrl = url.replace('/upload/', `/upload/${watermarkTransform}/`);
    // Debug log for checking the final URL in the console
    console.log('[Cloudinary] Watermark URL:', finalUrl);
    return finalUrl;
  }
  
  return url;
};

/**
 * Extracts the public_id from a Cloudinary URL
 */
export const getPublicIdFromUrl = (url) => {
  if (!url || !url.includes('cloudinary.com')) return null;
  
  try {
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;
    
    // The public_id is everything after the version (v1234567) or after /upload/ if no version
    const remainingParts = parts.slice(uploadIndex + 1);
    
    // If the first part of remaining starts with 'v' followed by digits, it's a version
    if (remainingParts.length > 0 && remainingParts[0].match(/^v\d+$/)) {
      remainingParts.shift();
    }
    
    // Join the remaining parts and remove the file extension
    // We handle cases where there might be multiple dots or path separators
    const fullPath = remainingParts.join('/');
    const publicId = fullPath.substring(0, fullPath.lastIndexOf('.')) || fullPath;
    
    return decodeURIComponent(publicId);
  } catch (e) {
    console.error("Error extracting Public ID:", e);
    return null;
  }
};
