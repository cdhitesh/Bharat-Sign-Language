// backend/config/db.js

import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These are the recommended options for production
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected. Attempting to reconnect...");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("MongoDB reconnected.");
    });

  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;