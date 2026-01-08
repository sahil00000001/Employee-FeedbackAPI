import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI as string);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);
    
    // List collections to verify
    const collections = await conn.connection.db?.listCollections().toArray();
    console.log('📂 Available Collections:');
    collections?.forEach(c => console.log(`   - ${c.name}`));
    
  } catch (error: any) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
