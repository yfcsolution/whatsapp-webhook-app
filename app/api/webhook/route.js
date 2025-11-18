import { connectDB } from "@/lib/db";
import Message from "@/models/Message";

// ==========================
// 📌 Webhook Verification (GET)
// ==========================
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WEBHOOK_VERIFY_TOKEN) {
    console.log("✔ Webhook Verified Successfully!");
    return new Response(challenge, { status: 200 });
  } else {
    console.error("❌ Webhook Verification Failed");
    return new Response("Verification failed", { status: 403 });
  }
}

// ==========================
// 📌 Receive Messages (POST)
// ==========================
export async function POST(req) {
  await connectDB();
  const body = await req.json();
  console.log("🔔 Webhook Received:", JSON.stringify(body, null, 2));

  try {
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;
    const contacts = value?.contacts;

    if (messages) {
      for (const msg of messages) {
        const contact = contacts?.find((c) => c.wa_id === msg.from);

        await Message.create({
          from: msg.from,
          to: value.metadata?.display_phone_number,
          text: msg.text?.body || `[${msg.type} message]`,
          type: "incoming",
          messageType: msg.type,
          status: "delivered",
          messageId: msg.id,
          timestamp: new Date(parseInt(msg.timestamp) * 1000),
          contactName: contact?.profile?.name || "Unknown"
        });

        console.log(`✅ Incoming message saved from ${msg.from}`);
      }
    }

    return new Response(JSON.stringify({ status: "received" }), { status: 200 });
  } catch (err) {
    console.error("❌ Error in webhook:", err);
    return new Response(
      JSON.stringify({ status: "error", error: err.message }),
      { status: 500 }
    );
  }
}
