import mongoose from "mongoose";

const { MONGO_URL: mongoURL } = process.env;

export async function setupMongo() {
  try {
    if (mongoose.connection.readyState === 1) {
      return;
    }
    console.log("🎲Connecting to database");
    await mongoose.connect(String(mongoURL), {
      serverSelectionTimeoutMS: 3000,
    });
    console.log("🆗Database connected");
  } catch {
    throw new Error("❌Database not connected");
  }
}
