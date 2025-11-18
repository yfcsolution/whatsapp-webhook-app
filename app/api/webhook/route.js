import { connectDB } from "@/lib/db";
import Message from "@/models/Message";

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
      return new Response(hub_challenge, { status: 200 });
    } else {
      console.error("❌ Webhook Verification Failed");
      return new Response("Verification failed", { status: 403 });
    }
  } catch (err) {
    console.error("❌ GET Webhook Error:", err);
    return new Response("Server Error", { status: 500 });
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
    console.error("❌ Error in POST Webhook:", err);
    return new Response(
      JSON.stringify({ status: "error", error: err.message }),
      { status: 500 }
    );
  }
}
