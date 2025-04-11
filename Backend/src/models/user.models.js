import mongoose from "mongoose";
import { Schema } from "mongoose";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    fullname: {
      type: String,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    email: {
      type: String,
      unique: true,
    },
    avatar: {
      type: String,
    },
    lifelineCount: {
      type: Number,
      default: 0,
    },
    lastModifiedReset: {
      type: Date,
      default: Date.now,
    },
    settings: {
      preferredStartHour: { type: Number, default: 4 }, // 4 AM day start
    },
    token: {
      type: String,
    }
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
