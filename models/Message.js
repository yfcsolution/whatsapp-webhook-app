import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  // Basic message info
  from: { type: String, required: true },        // Sender phone number
  to: { type: String, required: true },          // Receiver phone number
  text: { type: String, required: true },        // Message content
  type: { 
    type: String, 
    enum: ['incoming', 'outgoing', 'template'], 
    required: true 
  },
  
  // Message metadata
  messageType: { 
    type: String, 
    enum: ['text', 'template', 'image', 'audio', 'video', 'document'],
    default: 'text'
  },
  templateName: { type: String },                // For template messages
  status: { 
    type: String, 
    enum: ['sent', 'delivered', 'read', 'failed'],
    default: 'sent'
  },
  
  // WhatsApp specific
  messageId: { type: String },                   // WhatsApp message ID
  timestamp: { type: Date, default: Date.now },  // Message timestamp
  
  // Contact info
  contactName: { type: String },                 // Optional: contact name
  
  // System fields
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
MessageSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.Message || mongoose.model("Message", MessageSchema);