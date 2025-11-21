import axios from 'axios';

export async function sendWhatsAppMessage(to, message) {
  try {
    const phoneId = process.env.WHATSAPP_PHONE_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const apiUrl = `https://graph.facebook.com/v17.0/${phoneId}/messages`;

    console.log('📞 WhatsApp API Details:');
    console.log('   Phone ID:', phoneId);
    console.log('   Token exists:', !!accessToken);
    console.log('   Token length:', accessToken?.length);
    console.log('   To:', to);
    console.log('   Message:', message);
    console.log('   API URL:', apiUrl);

    const requestBody = {
      messaging_product: "whatsapp",
      to: to,
      text: { body: message },
    };

    console.log('📦 Request Body:', JSON.stringify(requestBody, null, 2));

    const response = await axios.post(apiUrl, requestBody, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    console.log('✅ WhatsApp API Response:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('❌ WhatsApp API Error Details:');
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Status Text:', error.response.statusText);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
      console.error('   Headers:', error.response.headers);
    } else if (error.request) {
      console.error('   No response received');
      console.error('   Request:', error.request);
    } else {
      console.error('   Error message:', error.message);
    }
    console.error('   Full error:', error);
    
    throw error;
  }
}