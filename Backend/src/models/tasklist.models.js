import mongoose from "mongoose";
import { Schema } from "mongoose";

const taskListSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
    percentageCompleted: {
      type: Number,
      default: 0,
    },
    date: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure only one TaskList per user per day
taskListSchema.index({ user: 1, date: 1 }, { unique: true });

export const TaskList = mongoose.model("TaskList", taskListSchema);
