import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export async function uploadToCloudinary(fileBuffer, fileName, folder = 'whatsapp-media') {
  try {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: folder,
          public_id: fileName.replace(/\.[^/.]+$/, ""), // Remove file extension
          overwrite: true,
          // Add 30-day cache control for media persistence
          cache_control: "max-age=2592000",
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString(),
          chunk_size: 6000000,
        },
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('✅ Cloudinary upload successful:', result.secure_url);
            console.log('📅 Media expires in 30 days');
            resolve(result);
          }
        }
      ).end(fileBuffer);
    });
  } catch (error) {
    console.error('❌ Cloudinary upload failed:', error);
    throw error;
  }
}

// New function for uploads with enhanced cache control
export async function uploadWithCache(fileBuffer, fileName, folder = 'whatsapp-media', options = {}) {
  try {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: folder,
          public_id: fileName.replace(/\.[^/.]+$/, ""),
          overwrite: true,
          // Enhanced cache control for 30-day retention
          cache_control: "max-age=2592000, public",
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString(),
          chunk_size: 6000000,
          // Additional optimizations
          quality: "auto:good",
          fetch_format: "auto",
          ...options
        },
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary cache upload error:', error);
            reject(error);
          } else {
            console.log('✅ Cloudinary cache upload successful:', result.secure_url);
            console.log('📅 Media cached for 30 days');
            resolve(result);
          }
        }
      ).end(fileBuffer);
    });
  } catch (error) {
    console.error('❌ Cloudinary cache upload failed:', error);
    throw error;
  }
}

// Special function for stickers with WhatsApp optimization
export async function uploadSticker(fileBuffer, fileName, folder = 'whatsapp-stickers') {
  try {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: folder,
          public_id: fileName.replace(/\.[^/.]+$/, ""),
          overwrite: true,
          // Sticker-specific optimizations for WhatsApp
          transformation: [
            { width: 512, height: 512, crop: "limit" },
            { format: "webp" },
            { quality: "auto:best" }
          ],
          // Cache control
          cache_control: "max-age=2592000",
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString(),
        },
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary sticker upload error:', error);
            reject(error);
          } else {
            console.log('✅ Cloudinary sticker upload successful:', result.secure_url);
            console.log('🔄 Sticker optimized for WhatsApp (512x512 WebP)');
            console.log('📅 Sticker cached for 30 days');
            resolve(result);
          }
        }
      ).end(fileBuffer);
    });
  } catch (error) {
    console.error('❌ Cloudinary sticker upload failed:', error);
    throw error;
  }
}

// Function to generate optimized URL with cache control
export function getOptimizedUrl(originalUrl, mediaType = 'auto') {
  if (!originalUrl || !originalUrl.includes('cloudinary.com')) {
    return originalUrl;
  }

  try {
    let optimizedUrl = originalUrl;
    
    // Add transformations based on media type
    if (originalUrl.includes('/upload/')) {
      const transformations = [];
      
      switch (mediaType) {
        case 'sticker':
          transformations.push('c_scale,w_512,h_512');
          transformations.push('f_webp');
          transformations.push('q_auto:best');
          break;
        case 'image':
          transformations.push('c_limit,w_1024');
          transformations.push('f_auto');
          transformations.push('q_auto:good');
          break;
        case 'document':
        case 'video':
        case 'audio':
          transformations.push('f_auto');
          break;
        default:
          transformations.push('f_auto,q_auto:good');
      }
      
      if (transformations.length > 0) {
        const transformString = transformations.join('/');
        optimizedUrl = originalUrl.replace('/upload/', `/upload/${transformString}/`);
      }
    }
    
    return optimizedUrl;
    
  } catch (error) {
    console.warn('⚠️ URL optimization failed, using original:', error.message);
    return originalUrl;
  }
}

// Function to extend expiration of existing media
export async function extendMediaExpiration(publicId, days = 30) {
  try {
    const result = await cloudinary.uploader.explicit(publicId, {
      type: 'upload',
      cache_control: `max-age=${days * 24 * 60 * 60}`,
      expires: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString()
    });
    
    console.log(`✅ Media expiration extended by ${days} days:`, publicId);
    return result;
    
  } catch (error) {
    console.error('❌ Media expiration extension failed:', error);
    throw error;
  }
}

export async function deleteFromCloudinary(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('✅ Cloudinary delete successful:', result);
    return result;
  } catch (error) {
    console.error('❌ Cloudinary delete failed:', error);
    throw error;
  }
}

// Export cloudinary instance for direct use
export { cloudinary };