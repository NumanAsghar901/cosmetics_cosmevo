import crypto from 'crypto';

export interface CloudinaryAssetDetails {
  publicId: string;
  resourceType: 'image' | 'video';
}

/**
 * Extracts publicId and resourceType ('image' | 'video') from any Cloudinary URL.
 * Handles transformations, version tags (v12345...), subfolders, and file extensions.
 */
export function extractCloudinaryDetails(url: string): CloudinaryAssetDetails | null {
  if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) {
    return null;
  }

  try {
    const cleanUrl = url.split('?')[0].split('#')[0];
    const isVideo = cleanUrl.includes('/video/upload/') || /\.(mp4|webm|mov|mkv|avi)$/i.test(cleanUrl);
    const resourceType: 'image' | 'video' = isVideo ? 'video' : 'image';

    const uploadMarker = isVideo ? '/video/upload/' : '/image/upload/';
    const parts = cleanUrl.split(uploadMarker);
    if (parts.length < 2) {
      // Fallback: check generic /upload/
      const genericParts = cleanUrl.split('/upload/');
      if (genericParts.length < 2) return null;
      parts[0] = genericParts[0];
      parts[1] = genericParts[1];
    }

    const pathAfterUpload = parts[1];
    const segments = pathAfterUpload.split('/');
    const finalSegments: string[] = [];
    let passedVersionOrTransform = false;

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      // Check for version segment e.g. v1741617283 or v1
      if (/^v\d+$/.test(seg)) {
        finalSegments.push(...segments.slice(i + 1));
        passedVersionOrTransform = true;
        break;
      }
    }

    let publicIdWithExt = '';
    if (passedVersionOrTransform) {
      publicIdWithExt = finalSegments.join('/');
    } else {
      // Skip transformation segments (e.g. c_scale,w_500, etc.)
      let startIndex = 0;
      while (
        startIndex < segments.length &&
        (segments[startIndex].includes(',') ||
          segments[startIndex].startsWith('c_') ||
          segments[startIndex].startsWith('w_') ||
          segments[startIndex].startsWith('h_') ||
          segments[startIndex].startsWith('q_') ||
          segments[startIndex].startsWith('f_'))
      ) {
        startIndex++;
      }
      publicIdWithExt = segments.slice(startIndex).join('/');
    }

    // Strip extension
    const lastDotIndex = publicIdWithExt.lastIndexOf('.');
    const publicId = lastDotIndex > 0 ? publicIdWithExt.substring(0, lastDotIndex) : publicIdWithExt;

    if (!publicId) return null;
    return {
      publicId: decodeURIComponent(publicId),
      resourceType,
    };
  } catch (err) {
    console.error('Error extracting Cloudinary details from URL:', url, err);
    return null;
  }
}

/**
 * Deletes a single asset from Cloudinary using Cloudinary's Destroy API.
 */
export async function deleteCloudinaryAsset(
  urlOrPublicId: string,
  explicitResourceType?: 'image' | 'video'
): Promise<{ success: boolean; result?: string; skipped?: boolean; error?: string }> {
  let publicId = urlOrPublicId;
  let resourceType: 'image' | 'video' = explicitResourceType || 'image';

  if (urlOrPublicId.includes('cloudinary.com')) {
    const extracted = extractCloudinaryDetails(urlOrPublicId);
    if (!extracted) {
      return { success: false, error: 'Could not parse Cloudinary URL' };
    }
    publicId = extracted.publicId;
    resourceType = explicitResourceType || extracted.resourceType;
  }

  let cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'kj5rzhaj';
  let apiKey = process.env.CLOUDINARY_API_KEY;
  let apiSecret = process.env.CLOUDINARY_API_SECRET;

  // Support CLOUDINARY_URL if provided (cloudinary://API_KEY:API_SECRET@CLOUD_NAME)
  if (process.env.CLOUDINARY_URL) {
    try {
      const match = process.env.CLOUDINARY_URL.match(/^cloudinary:\/\/([^:]+):([^@]+)@([^/]+)$/);
      if (match) {
        apiKey = apiKey || match[1];
        apiSecret = apiSecret || match[2];
        cloudName = cloudName || match[3];
      }
    } catch {}
  }

  if (!apiKey || !apiSecret) {
    console.warn(
      `[Cloudinary Delete Skipped] Cannot delete "${publicId}". CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET must be configured in .env.local and Vercel Environment Variables.`
    );
    return {
      success: false,
      skipped: true,
      error: 'CLOUDINARY_API_KEY or CLOUDINARY_API_SECRET is missing. Please add them to your environment variables to enable automatic asset deletion.',
    };
  }

  try {
    const timestamp = Math.floor(Date.now() / 1000);
    // Cloudinary signature must be SHA-1 of parameters sorted alphabetically: public_id, timestamp
    const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

    const formData = new URLSearchParams();
    formData.append('public_id', publicId);
    formData.append('timestamp', timestamp.toString());
    formData.append('api_key', apiKey);
    formData.append('signature', signature);

    const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const data = await res.json();
    if (res.ok && (data.result === 'ok' || data.result === 'not found')) {
      return { success: true, result: data.result };
    } else {
      const err = data.error?.message || data.result || 'Failed to destroy asset';
      console.warn(`[Cloudinary Delete Failed] for "${publicId}":`, err);
      return { success: false, error: err };
    }
  } catch (err: any) {
    console.error(`[Cloudinary Destroy Exception] for "${publicId}":`, err);
    return { success: false, error: err.message || 'Unknown network error' };
  }
}

/**
 * Deletes multiple assets from Cloudinary in parallel.
 */
export async function deleteMultipleCloudinaryAssets(urlsOrPublicIds: string[]) {
  if (!urlsOrPublicIds || !urlsOrPublicIds.length) return [];
  const results = await Promise.allSettled(
    urlsOrPublicIds.map((item) => deleteCloudinaryAsset(item))
  );
  return results.map((r, i) => ({
    target: urlsOrPublicIds[i],
    status: r.status === 'fulfilled' ? r.value : { success: false, error: 'Execution rejected' },
  }));
}
