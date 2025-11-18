import mongoose from "mongoose";

export async function connectDB() {
  if (mongoose.connection.readyState === 1) return; // already connected

  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/whatsapp-app", {
      dbName: "whatsapp-app",
    });
    console.log("✔ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}
