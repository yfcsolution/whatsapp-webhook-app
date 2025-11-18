import { connectDB } from "@/lib/db";
import Message from "@/models/Message";

export async function POST(req) {
  await connectDB();
  
  try {
    const { toNumber, templateName = "hello_world" } = await req.json();
    
    if (!toNumber) {
      return Response.json({ 
        success: false, 
        error: "Phone number is required" 
      });
    }

    const url = `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_ID}/messages`;

    const payload = {
      messaging_product: "whatsapp",
      to: toNumber,
      type: "template",
      template: {
        name: templateName,
        language: { code: "en_US" }
      }
    };

    console.log(`📤 Sending to: ${toNumber}, Template: ${templateName}`);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    
    // ✅ ADD DETAILED LOGGING
    console.log("📨 WhatsApp API Response:", JSON.stringify(data, null, 2));

    // Save to database
    if (data.messages && data.messages[0]) {
      await Message.create({
        from: process.env.WHATSAPP_PHONE_ID,
        to: toNumber,
        text: `${templateName} template message`,
        type: "outgoing",
        messageType: "template",
        templateName: templateName,
        status: "sent",
        messageId: data.messages[0].id,
        contactName: getContactName(toNumber)
      });
      console.log(`✅ Message saved to database`);
    }

    // ✅ Check for errors in the response
    if (data.error) {
      console.error("❌ WhatsApp API Error:", data.error);
      return Response.json({ 
        success: false, 
        error: data.error.message,
        details: data.error
      });
    }

    return Response.json({ 
      success: true, 
      data,
      message: `Message sent to ${getContactName(toNumber)}`
    });
  } catch (error) {
    console.error("❌ Error sending message:", error);
    return Response.json({ 
      success: false, 
      error: error.message 
    });
  }
}

function getContactName(phoneNumber) {
  const contacts = {
    "03010813515": "Laila",
    "03130541339": "CEO",
  };
  return contacts[phoneNumber] || `Contact (${phoneNumber})`;
}