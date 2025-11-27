import axios from 'axios';

export class WhatsAppAPI {
  static async sendMessage(to, messageData) {
    try {
      const phoneId = process.env.WHATSAPP_PHONE_ID;
      const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
      const apiUrl = `https://graph.facebook.com/v17.0/${phoneId}/messages`;

      console.log('📞 WhatsApp API Details:');
      console.log('   Phone ID:', phoneId);
      console.log('   To:', to);
      console.log('   Message Type:', messageData.messageType);
      
      let requestBody;

      switch (messageData.messageType) {
        case 'text':
          requestBody = {
            messaging_product: "whatsapp",
            to: to,
            type: "text",
            text: { body: messageData.text }
          };
          break;

        case 'image':
          // Add cache control and ensure image persistence
          const optimizedImageUrl = await this.addCacheControl(messageData.mediaUrl, 'image');
          requestBody = {
            messaging_product: "whatsapp",
            to: to,
            type: "image",
            image: {
              link: optimizedImageUrl,
              caption: messageData.caption
            }
          };
          break;

        case 'document':
          // Add cache control for documents
          const optimizedDocUrl = await this.addCacheControl(messageData.mediaUrl, 'document');
          requestBody = {
            messaging_product: "whatsapp",
            to: to,
            type: "document",
            document: {
              link: optimizedDocUrl,
              caption: messageData.caption,
              filename: messageData.fileName
            }
          };
          break;

        case 'sticker':
          // Special handling for stickers to prevent name-only display
          const validatedStickerUrl = await this.validateAndOptimizeSticker(messageData.mediaUrl);
          requestBody = {
            messaging_product: "whatsapp",
            to: to,
            type: "sticker",
            sticker: {
              link: validatedStickerUrl
            }
          };
          break;

        case 'audio':
          const optimizedAudioUrl = await this.addCacheControl(messageData.mediaUrl, 'audio');
          requestBody = {
            messaging_product: "whatsapp",
            to: to,
            type: "audio",
            audio: {
              link: optimizedAudioUrl
            }
          };
          break;

        case 'video':
          const optimizedVideoUrl = await this.addCacheControl(messageData.mediaUrl, 'video');
          requestBody = {
            messaging_product: "whatsapp",
            to: to,
            type: "video",
            video: {
              link: optimizedVideoUrl,
              caption: messageData.caption
            }
          };
          break;

        // For unsupported types, fallback to text
        default:
          requestBody = {
            messaging_product: "whatsapp",
            to: to,
            type: "text",
            text: { body: messageData.text || `[${messageData.messageType} message]` }
          };
      }

      console.log('📦 Request Body:', JSON.stringify(requestBody, null, 2));

      const response = await axios.post(apiUrl, requestBody, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'max-age=2592000' // 30 days cache
        },
        timeout: 30000
      });

      console.log('✅ WhatsApp API Response:', response.data);
      
      // Log media persistence info
      if (messageData.messageType !== 'text') {
        console.log(`📎 Media sent with 30-day retention: ${messageData.messageType}`);
      }
      
      return response.data;
      
    } catch (error) {
      console.error('❌ WhatsApp API Error:');
      
      if (error.response) {
        console.error('   Status:', error.response.status);
        console.error('   Data:', JSON.stringify(error.response.data, null, 2));
        
        const errorMsg = error.response.data.error?.message || 'WhatsApp API Error';
        throw new Error(`WhatsApp API: ${errorMsg}`);
      } else if (error.request) {
        console.error('   No response received');
        throw new Error('No response from WhatsApp API');
      } else {
        console.error('   Error message:', error.message);
        throw error;
      }
    }
  }

  // Add cache control to media URLs for 30-day retention
  static async addCacheControl(mediaUrl, mediaType) {
    if (!mediaUrl) return mediaUrl;
    
    try {
      // For Cloudinary URLs, add cache parameters
      if (mediaUrl.includes('cloudinary.com')) {
        if (mediaUrl.includes('/upload/')) {
          // Add cache control transformation for Cloudinary
          const cacheParams = 'c_limit,f_auto,q_auto:good';
          return mediaUrl.replace('/upload/', `/upload/${cacheParams}/`);
        }
      }
      
      // For other URLs, add cache parameter
      const separator = mediaUrl.includes('?') ? '&' : '?';
      return `${mediaUrl}${separator}cache=${Math.floor(Date.now() / 1000) + 2592000}`; // 30 days
      
    } catch (error) {
      console.warn('⚠️ Cache control addition failed, using original URL:', error.message);
      return mediaUrl;
    }
  }

  // Special validation and optimization for stickers
  static async validateAndOptimizeSticker(stickerUrl) {
    if (!stickerUrl) {
      throw new Error('Sticker URL is required');
    }

    try {
      let optimizedUrl = stickerUrl;

      // For Cloudinary stickers, ensure WebP format and proper dimensions
      if (stickerUrl.includes('cloudinary.com')) {
        if (stickerUrl.includes('/upload/')) {
          // Add transformations for optimal sticker display
          // WhatsApp recommends: WebP format, 512x512 dimensions
          const stickerTransformations = 'c_scale,w_512,h_512/f_webp';
          optimizedUrl = stickerUrl.replace('/upload/', `/upload/${stickerTransformations}/`);
          console.log('🔄 Sticker optimized for WhatsApp:', optimizedUrl);
        }
      }

      // Add cache control
      optimizedUrl = await this.addCacheControl(optimizedUrl, 'sticker');
      
      return optimizedUrl;
      
    } catch (error) {
      console.warn('⚠️ Sticker optimization failed, using original:', error.message);
      return await this.addCacheControl(stickerUrl, 'sticker');
    }
  }

  // New method specifically for sending stickers
  static async sendSticker(to, stickerUrl, caption = '') {
    return await this.sendMessage(to, {
      messageType: 'sticker',
      mediaUrl: stickerUrl,
      caption: caption
    });
  }

  // New method for sending images with guaranteed persistence
  static async sendImageWithPersistence(to, imageUrl, caption = '') {
    const optimizedUrl = await this.addCacheControl(imageUrl, 'image');
    return await this.sendMessage(to, {
      messageType: 'image',
      mediaUrl: optimizedUrl,
      caption: caption
    });
  }

  // New method for sending documents with guaranteed persistence
  static async sendDocumentWithPersistence(to, docUrl, fileName, caption = '') {
    const optimizedUrl = await this.addCacheControl(docUrl, 'document');
    return await this.sendMessage(to, {
      messageType: 'document',
      mediaUrl: optimizedUrl,
      fileName: fileName,
      caption: caption
    });
  }
}

// Export utility functions for use in other files
export const WhatsAppUtils = {
  addCacheControl: WhatsAppAPI.addCacheControl,
  validateAndOptimizeSticker: WhatsAppAPI.validateAndOptimizeSticker
};