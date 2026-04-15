import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Sign from "../models/Sign.js";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const DATASET_PATH = "C:/Users/Bhavya/Downloads/Indian";

const uploadAndSeed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const folders = fs.readdirSync(DATASET_PATH).filter((f) =>
    fs.statSync(path.join(DATASET_PATH, f)).isDirectory()
  );

  console.log(`Found ${folders.length} folders: ${folders.join(", ")}`);

  for (const folder of folders) {
    const folderPath = path.join(DATASET_PATH, folder);
    const images     = fs.readdirSync(folderPath)
      .filter((f) => /\.(jpg|jpeg|png)$/i.test(f));

    if (images.length === 0) continue;

    // Upload first image only per folder as representative
    const firstImage = path.join(folderPath, images[0]);

    try {
      console.log(`Uploading ${folder}...`);
      const result = await cloudinary.uploader.upload(firstImage, {
        folder:    "signlearn/signs",
        public_id: `sign_${folder}`,
        overwrite: true,
      });

      // Update the sign collextion with the Cloudinary URL
      await Sign.findOneAndUpdate(
        { name: folder },
        { imageUrl: result.secure_url }
      );

      console.log(`${folder} → ${result.secure_url}`);
    } catch (err) {
      console.error(`Failed to upload ${folder}:`, err.message);
    }
  }

  console.log("\nAll images uploaded and database updated!");
  process.exit(0);
};

uploadAndSeed();