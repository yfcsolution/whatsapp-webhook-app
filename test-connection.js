const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://ayema9865_db_user:73NmaWjKeVUQIJ71@cluster0.i196yjb.mongodb.net/whatsapp-app?retryWrites=true&w=majority";

async function testConnection() {
  try {
    console.log('🔄 Attempting to connect to MongoDB Atlas...');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ SUCCESS: Connected to MongoDB Atlas!');
    
    // Test if we can create a collection and insert data
    const testDoc = await mongoose.connection.db.collection('test').insertOne({
      message: 'Test connection from local machine',
      timestamp: new Date(),
      app: 'whatsapp-webhook-app'
    });
    console.log('✅ Test document inserted with ID:', testDoc.insertedId);
    
    // Read it back to verify
    const foundDoc = await mongoose.connection.db.collection('test').findOne({_id: testDoc.insertedId});
    console.log('✅ Document retrieved:', foundDoc.message);
    
    await mongoose.connection.close();
    console.log('✅ Connection closed. All tests passed!');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection();