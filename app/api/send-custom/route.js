import { connectDB } from '@/lib/db';
import { WhatsAppAPI, WhatsAppUtils } from '@/lib/whatsapp';
import { uploadToCloudinary, uploadSticker, uploadWithCache, getOptimizedUrl } from '@/lib/cloudinary';
import Message from '@/models/Message';
import Contact from '@/models/contact';

export async function POST(request) {
  try {
    console.log('🚀 send-custom API called - UPDATED WITH MEDIA PERSISTENCE');

    const { 
      number, 
      message, 
      messageType = 'text', 
      fileName, 
      fileData,
      mimeType,
      contactName, 
      contactInfo, 
      pollData, 
      eventData 
    } = await request.json();
    
    console.log('📨 Sending to:', number, 'Type:', messageType, 'File:', fileName);

    if (!number) {
      return Response.json({ error: 'Phone number is required' }, { status: 400 });
    }

    await connectDB();

    // Update or create contact
    await Contact.findOneAndUpdate(
      { phoneNumber: number },
      { 
        phoneNumber: number,
        name: contactName || getContactName(number),
        lastMessage: new Date(),
        $inc: { messageCount: 1 }
      },
      { upsert: true, new: true }
    );

    let mediaUrl = null;
    let cloudinaryResult = null;

    // Handle file upload to Cloudinary for media messages
    if (['document', 'image', 'audio', 'video', 'sticker'].includes(messageType) && fileData) {
      try {
        console.log('☁️ Uploading to Cloudinary with 30-day cache...');
        
        // Convert base64 to buffer
        const fileBuffer = Buffer.from(fileData.split(',')[1], 'base64');
        
        // Use specialized upload functions based on media type
        if (messageType === 'sticker') {
          console.log('🔄 Using sticker-optimized upload...');
          cloudinaryResult = await uploadSticker(fileBuffer, fileName, 'whatsapp-stickers');
        } else {
          // Use cache-optimized upload for other media types
          cloudinaryResult = await uploadWithCache(fileBuffer, fileName, 'whatsapp-media');
        }
        
        mediaUrl = cloudinaryResult.secure_url;
        
        console.log('✅ Cloudinary upload successful:', mediaUrl);
        console.log('📅 Media cached for 30 days');
        
      } catch (uploadError) {
        console.error('❌ Cloudinary upload failed:', uploadError);
        throw new Error(`Failed to upload media to Cloudinary: ${uploadError.message}`);
      }
    }

    // Prepare message data for WhatsApp with optimized URLs
    const whatsappMessageData = {
      messageType: messageType,
      text: message,
      fileName: fileName,
      mediaUrl: mediaUrl, // Cloudinary URL with cache control
      caption: message,
      contactName: contactName,
      contactInfo: contactInfo,
      pollData: pollData,
      eventData: eventData
    };

    // Send via WhatsApp API with enhanced media handling
    let whatsappData;
    
    // Use specialized methods for better media persistence
    if (messageType === 'sticker' && mediaUrl) {
      console.log('🎯 Using dedicated sticker sending method...');
      whatsappData = await WhatsAppAPI.sendSticker(number, mediaUrl, message);
    } else if (messageType === 'image' && mediaUrl) {
      console.log('🖼️ Using image with persistence method...');
      whatsappData = await WhatsAppAPI.sendImageWithPersistence(number, mediaUrl, message);
    } else if (messageType === 'document' && mediaUrl) {
      console.log('📄 Using document with persistence method...');
      whatsappData = await WhatsAppAPI.sendDocumentWithPersistence(number, mediaUrl, fileName, message);
    } else {
      // Use standard method for other types
      whatsappData = await WhatsAppAPI.sendMessage(number, whatsappMessageData);
    }

    // Prepare data for MongoDB
    const dbMessage = {
      from: process.env.WHATSAPP_PHONE_ID,
      to: number,
      text: message,
      type: "outgoing",
      messageType: messageType,
      status: "sent",
      messageId: whatsappData.messages?.[0]?.id,
      timestamp: new Date(),
      contactName: contactName || getContactName(number),
      // Add media persistence info
      mediaPersistence: {
        cacheDuration: '30 days',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        optimized: true
      }
    };

    // Add type-specific data
    if (fileName || mediaUrl) {
      dbMessage.mediaInfo = {
        fileName: fileName,
        mediaUrl: mediaUrl,
        cloudinaryId: cloudinaryResult?.public_id,
        mimeType: mimeType,
        // Additional cache info
        cacheControl: 'max-age=2592000',
        optimizedUrl: getOptimizedUrl(mediaUrl, messageType)
      };
    }
    if (contactName || contactInfo) {
      dbMessage.contactData = {
        name: contactName,
        phone: contactInfo,
        info: contactInfo
      };
    }
    if (pollData) {
      dbMessage.pollData = pollData;
    }
    if (eventData) {
      dbMessage.eventData = eventData;
    }

    // Save to MongoDB
    const savedMessage = await Message.create(dbMessage);
    console.log("💾 Message saved to DB:", savedMessage._id);
    console.log("📅 Media will be available for 30 days");

    return Response.json({
      success: true,
      message: savedMessage,
      whatsappId: whatsappData.messages?.[0]?.id,
      cloudinaryUrl: mediaUrl,
      mediaPersistence: {
        cacheDuration: '30 days',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        optimized: true
      }
    });

  } catch (error) {
    console.error("❌ Error in send-custom:", error);
    
    // Enhanced error logging for media issues
    if (error.message.includes('sticker') || error.message.includes('media')) {
      console.error('🔧 Media-specific error - check Cloudinary configuration');
    }
    
    return Response.json({ 
      success: false,
      error: error.message,
      details: 'Check Cloudinary configuration and WhatsApp API limits'
    }, { status: 500 });
  }
}

// Helper function to get optimized media URL
function getOptimizedMediaUrl(originalUrl, mediaType) {
  if (!originalUrl) return originalUrl;
  
  return getOptimizedUrl(originalUrl, mediaType);
}

function getContactName(phoneNumber) {
  const contacts = {
    "03010813515": "Laila",
    "03130541339": "CEO",
  };
  return contacts[phoneNumber] || `Contact (${phoneNumber})`;
}