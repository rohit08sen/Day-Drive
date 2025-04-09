import mongoose from "mongoose";

const taskListSchema = new mongoose.Schema({
  percentageCompleted: {
    type: Number,
    required: false,
  },

  tasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "task",
    },
  ],

  date: {
    type: Date.now,
    required: true,
  },
});

module.exports = mongoose.model("TaskList", taskListSchema);
