import mongoose from "mongoose";
const taskSchema = new mongoose.Schema({
  task: {
    type: String,
  },
  user: {
    type: mongoose.Schema.types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Task", taskSchema);
