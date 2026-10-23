import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dyslexia_assistant';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully to: ${uri}`);
  } catch (error) {
    isConnected = false;
    console.warn(`[MongoDB] Connection notice: Unable to connect to MongoDB (${error.message}).`);
    console.warn(`[MongoDB] Running with in-memory persistence fallback for seamless standalone execution.`);
  }
};

export const getDBStatus = () => ({
  connected: isConnected,
  ready: mongoose.connection.readyState === 1
});
