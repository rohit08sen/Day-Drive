import mongoose from "mongoose";
const { Schema } = mongoose;

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
    dob: {
      type: Date,
    },
    avatar: {
      type: String,
    },
    tasksModifiedCount: {
      type: Number,
      default: 0,
    },
    lastModifiedReset: {
      type: Date,
      default: Date.now,
    },
    settings: {
      preferredStartHour: { type: Number, default: 4 }, // 4 AM day start
      notificationsEnabled: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
