import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  lastMessage: { type: Date },
  messageCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Contact || mongoose.model("Contact", ContactSchema);