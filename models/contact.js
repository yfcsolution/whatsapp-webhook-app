import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  lastMessage: { type: Date },
  messageCount: { type: Number, default: 0 },
  
  // ADDED: Support for your frontend
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date },
  profilePic: String,
  isGroup: { type: Boolean, default: false },
  favorite: { type: Boolean, default: false },
  unread: { type: Boolean, default: false },
  
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Contact || mongoose.model("Contact", ContactSchema);