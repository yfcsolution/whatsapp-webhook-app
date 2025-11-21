import { connectDB } from '@/lib/db';
import Message from '@/models/Message';

export async function POST(request) {
  try {
    console.log('🚀 send-custom API called');

    const { number, message } = await request.json();
    console.log('📨 Sending to:', number, 'Message:', message);

    if (!number || !message) {
      return Response.json({ error: 'Number and message are required' }, { status: 400 });
    }

    await connectDB();
    console.log('✅ Database connected');

    // --- SEND MESSAGE TO WHATSAPP ---
    const whatsappRes = await fetch(process.env.WHATSAPP_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: number,
        type: "text",
        text: { body: message }
      })
    });

    const whatsappData = await whatsappRes.json();
    console.log("📡 WhatsApp API Response:", whatsappData);

    if (!whatsappRes.ok) {
      return Response.json({
        error: "WhatsApp API Error",
        details: whatsappData
      }, { status: 500 });
    }

    // --- SAVE MESSAGE IN DB ---
    const newMessage = new Message({
      from: "system",
      to: number,
      text: message,
      type: "outgoing",
      messageType: "text",
      status: "sent",
      whatsappResponseId: whatsappData.messages?.[0]?.id
    });

    const savedMessage = await newMessage.save();
    console.log("💾 Message saved to DB:", savedMessage._id);

    return Response.json({
      success: true,
      message: savedMessage,
      whatsappId: whatsappData.messages?.[0]?.id
    });

  } catch (error) {
    console.error("❌ Error in send-custom:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
