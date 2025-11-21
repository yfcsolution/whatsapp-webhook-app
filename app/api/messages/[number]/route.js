import { connectDB } from '@/lib/db';  // ✅ Use named import
import Message from '@/models/Message';

export async function GET(request, { params }) {
  try {
    // Fix for Next.js 16: await the params
    const { number } = await params;
    
    await connectDB();  // ✅ Use connectDB instead of dbConnect
    
    console.log('🔍 Fetching messages for number:', number);

    // Find messages where this number is either sender or receiver
    const messages = await Message.find({
      $or: [
        { from: number },
        { to: number }
      ]
    }).sort({ timestamp: 1 });

    console.log(`✅ Found ${messages.length} messages for ${number}`);
    
    return Response.json(messages);
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    return Response.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}