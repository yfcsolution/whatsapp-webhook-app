import { connectDB } from '@/lib/db';  // ✅ Named import
import { ContactManager } from '@/lib/contactManager';
import Message from '@/models/Message';
import { NextResponse } from 'next/server';
import fs from 'fs';

// ==========================
// 📌 Webhook Verification (GET)
// ==========================
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const hub_mode = searchParams.get("hub.mode");
    const hub_verify_token = searchParams.get("hub.verify_token");
    const hub_challenge = searchParams.get("hub.challenge");

    // Use environment variable for token verification
    if (hub_mode === "subscribe" && hub_verify_token === process.env.WEBHOOK_VERIFY_TOKEN) {
      console.log("✔ Webhook Verified Successfully!");
      return new Response(hub_challenge, {
        status: 200,
        headers: { "Content-Type": "text/plain" }, // ⚠ Must be plain text
      });
    } else {
      console.error("❌ Webhook Verification Failed");
      return new Response("Verification failed", {
        status: 403,
        headers: { "Content-Type": "text/plain" },
      });
    }
  } catch (err) {
    console.error("❌ GET Webhook Error:", err);
    return new Response("Server Error", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}

// ==========================
// 📌 Receive Messages (POST)
// ==========================
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    console.log("🔔 Webhook Received:", JSON.stringify(body, null, 2));

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;
    const contacts = value?.contacts;

    if (messages) {
      for (const msg of messages) {
        const contact = contacts?.find((c) => c.wa_id === msg.from);
        const contactPhone = msg.from;

        // Auto-create storage for this contact
        const contactStorage = ContactManager.getContactStorage(contactPhone);

        // Save to MongoDB
        const mongoMessage = await Message.create({
          from: msg.from,
          to: value.metadata?.display_phone_number,
          text: msg.text?.body || `[${msg.type} message]`,
          type: "incoming",
          messageType: msg.type,
          status: "delivered",
          messageId: msg.id,
          timestamp: new Date(parseInt(msg.timestamp) * 1000),
          contactName: contact?.profile?.name || "Unknown",
        });

        console.log(`✅ Incoming message saved to MongoDB from ${msg.from}`);

        // Save to file storage (chat history)
        if (msg.text?.body) {
          saveChatMessage(contactStorage, {
            type: 'text',
            content: msg.text.body,
            from: msg.from,
            direction: 'incoming',
            timestamp: new Date().toISOString(),
            messageId: msg.id,
            mongoId: mongoMessage._id.toString()
          });
        }

        // Handle media messages (images, documents, audio)
        if (msg.type === 'image' || msg.type === 'document' || msg.type === 'audio') {
          await handleMediaMessage(contactStorage, msg, msg.type);
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (err) {
    console.error("❌ Error in POST Webhook:", err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

// ==========================
// 📌 Helper Functions
// ==========================

function saveChatMessage(contactStorage, message) {
  try {
    const chatFile = contactStorage.getPath('chat-history', 'messages.json');
    let messages = [];

    if (fs.existsSync(chatFile)) {
      messages = JSON.parse(fs.readFileSync(chatFile, 'utf8'));
    }

    messages.push(message);
    fs.writeFileSync(chatFile, JSON.stringify(messages, null, 2));
    console.log(`💾 Chat message saved to file storage for ${message.from}`);
  } catch (error) {
    console.error('❌ Error saving chat message to file:', error);
  }
}

async function handleMediaMessage(contactStorage, message, fileType) {
  try {
    // Store media metadata
    const mediaInfo = {
      type: message.type,
      messageId: message.id,
      timestamp: new Date().toISOString(),
      metadata: message[message.type], // image, document, or audio object
      caption: message[message.type]?.caption || null,
      mime_type: message[message.type]?.mime_type || null,
      filename: message[message.type]?.filename || null
    };

    const mediaFile = contactStorage.getPath('chat-history', `media-${message.id}.json`);
    fs.writeFileSync(mediaFile, JSON.stringify(mediaInfo, null, 2));
    
    console.log(`📁 Media metadata saved for ${message.id} (${fileType})`);
    
    // In a real implementation, you'd download the media from WhatsApp API here
    // and save it to the appropriate folder (documents, images, audio)
    
  } catch (error) {
    console.error('❌ Error handling media message:', error);
  }
}