// backend/models/User.js

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: [true, "Clerk ID is required"],
      unique: true,
      index: true, // Indexed for fast lookups by clerkId
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: get all history entries for this user (not stored in DB)
userSchema.virtual("history", {
  ref: "History",
  localField: "_id",
  foreignField: "userId",
});

// Static method: find or create user by clerkId (upsert pattern)
userSchema.statics.findOrCreate = async function ({ clerkId, name, email }) {
  let user = await this.findOne({ clerkId });
  if (!user) {
    user = await this.create({ clerkId, name, email });
  }
  return user;
};

const User = mongoose.model("User", userSchema);

export default User;