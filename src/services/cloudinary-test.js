#!/usr/bin/env node

import { v2 as cloudinary } from "cloudinary";

// Cloudinary Configuration
cloudinary.config({
  cloud_name: "dsvavxf7c",
  api_key: "143278559241343",
  api_secret: "rLnPsomkcQ9rfPKdzB9WOzzQQgA",
});

async function main() {
  try {
    console.log("Starting Cloudinary test...\n");

    // Upload sample image from Cloudinary demo
    const uploadResult = await cloudinary.uploader.upload(
      "https://res.cloudinary.com/demo/image/upload/sample.jpg"
    );

    console.log("✅ Upload successful");
    console.log("\nSecure URL:");
    console.log(uploadResult.secure_url);

    console.log("\nPublic ID:");
    console.log(uploadResult.public_id);

    // Get image metadata
    const details = await cloudinary.api.resource(
      uploadResult.public_id
    );

    console.log("\n📷 Image Details");
    console.log("Width:", details.width);
    console.log("Height:", details.height);
    console.log("Format:", details.format);
    console.log("File Size:", details.bytes, "bytes");

    // Create optimized URL
    const transformedUrl = cloudinary.url(
      uploadResult.public_id,
      {
        fetch_format: "auto", // f_auto => automatic image format
        quality: "auto", // q_auto => automatic image quality
      }
    );

    console.log(
      "\n🎉 Done! Click link below to see optimized version of the image."
    );
    console.log(
      "Check the size and the format."
    );

    console.log("\nOptimized URL:");
    console.log(transformedUrl);
  } catch (error) {
    console.error("❌ Error:");
    console.error(error);
  }
}

main();
