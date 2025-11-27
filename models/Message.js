import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  // Basic message info
  from: { type: String, required: true },        // Sender phone number
  to: { type: String, required: true },          // Receiver phone number
  text: { type: String },                        // Message content (optional for media)
  type: { 
    type: String, 
    enum: ['incoming', 'outgoing', 'template'], 
    required: true 
  },
  
  // Message metadata - EXPANDED FOR YOUR FRONTEND
  messageType: { 
    type: String, 
    enum: [
      'text', 'template', 'image', 'audio', 'video', 'document',
      'contact', 'poll', 'event', 'sticker'  // ADDED YOUR TYPES
    ],
    default: 'text'
  },
  templateName: { type: String },                // For template messages
  
  // Status
  status: { 
    type: String, 
    enum: ['sent', 'delivered', 'read', 'failed'],
    default: 'sent'
  },
  
  // WhatsApp specific
  messageId: { type: String },                   // WhatsApp message ID
  timestamp: { type: Date, default: Date.now },
  
  // Contact info
  contactName: { type: String },
  
  // MEDIA SUPPORT FOR YOUR FRONTEND
  mediaInfo: {
    fileName: String,
    fileSize: String,
    mimeType: String,
    url: String,        // URL for downloaded media
    caption: String     // Caption for media messages
  },
  
  // CONTACT MESSAGE SUPPORT
  contactData: {
    name: String,
    phone: String,
    info: String
  },
  
  // POLL MESSAGE SUPPORT
  pollData: {
    question: String,
    options: [String],
    multipleAnswers: Boolean,
    votes: [Number],
    userVotes: mongoose.Schema.Types.Mixed  // Flexible object for votes
  },
  
  // EVENT MESSAGE SUPPORT  
  eventData: {
    name: String,
    description: String,
    startDate: String,
    startTime: String,
    location: String,
    attendees: Number,
    creator: String,
    attendeesList: [String]
  },
  
  // Error handling
  error: {
    code: String,
    message: String,
    details: mongoose.Schema.Types.Mixed
  },
  
  // System fields
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
MessageSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for better performance
MessageSchema.index({ from: 1, to: 1 });
MessageSchema.index({ timestamp: -1 });
MessageSchema.index({ messageId: 1 });

export default mongoose.models.Message || mongoose.model("Message", MessageSchema);