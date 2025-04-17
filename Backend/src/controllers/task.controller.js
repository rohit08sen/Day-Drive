import { asyncHandler } from "../middlewares/asyncHandler.js";
import { Task } from "../models/task.models.js";
import { TaskList } from "../models/tasklist.models.js";
import { recalculateTaskListCompletion } from "./tasklist.controller.js";


//1.Create task
const createTask = async (req, res) => {
  try {
    const { task, description, dueDate, priority, taskListId } = req.body;
    const userId = req.user._id;
    const newTask = await Task.create({
      task,
      description,
      dueDate,
      priority,
      user: userId
    });
    if (taskListId) {
      const taskList = await TaskList.findById(taskListId);
      if (taskList) {
        taskList.tasks.push(newTask._id);
        await taskList.save();
        await recalculateTaskListCompletion(taskList._id);
      }
    }
    res.status(201).json({
      message: "Task Created",
      newTask
    })
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//get All Tasks by user
const getTaskByUser = asyncHandler(async (req, res,next) => {
  const userId = req.user._id;
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ message: "Date is required" });
  }
  const selectedDate = new Date(date);
  const tasks = await Task.find({
    user: userId,
    createdAt: {
      $gte: new Date(selectedDate.setHours(0, 0, 0, 0)),
      $lt:new Date(selectedDate.setHours(23,59,59,999)),
    }
   }).sort({ createdAt: -1 });
  res.status(200).json({
    message: "Success",
    tasks
  })
})

/*
    🔍 How it Works
  User sends a date via query param:
  GET /api/tasks/by-date?date=2025-04-10
  The controller:
  Converts that string to a Date object.
  Searches for tasks createdAt on that full day (from 00:00 to 23:59).
  Only returns tasks belonging to the logged-in user.
*/

//3.Toggle Completion
const toggleTaskCompletion = asyncHandler(async (req, res, next) => {
  const { taskId } = req.params;
  const task = await Task.findById(taskId);
  if (!task) return res.status(404).json({
    message:"Task not Found"
  })

  task.completed = !task.completed;
  task.completedAt = task.completed ? new Date() : null;
  await task.save();

  //find tasklist this task and recalculate

  const taskList = await TaskList.findOne({ tasks: task._id })
  if (taskList) await recalculateTaskListCompletion(taskList._id);
  return res.status(200).json({ message: "Task updated", task });
})

//5.Delete Task
export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const task = await Task.findById(taskId);

    if (!task || !task.user.equals(userId)) {
      return res
        .status(404)
        .json({ message: "Task not found or unauthorized" });
    }

    // 🧠 Check and consume lifeline
    const now = new Date();
    const isSameMonth =
      now.getFullYear() === new Date(user.lastModifiedReset).getFullYear() &&
      now.getMonth() === new Date(user.lastModifiedReset).getMonth();

    if (!isSameMonth) {
      user.tasksModifiedCount = 0;
      user.lastModifiedReset = now;
    }

    if (user.tasksModifiedCount >= 2) {
      return res
        .status(403)
        .json({ message: "No lifelines left this month to delete tasks." });
    }

    // 💥 Remove task from TaskLists if attached
    await TaskList.updateMany(
      { tasks: task._id },
      { $pull: { tasks: task._id } }
    );

    await task.remove();

    // ✅ Consume lifeline
    user.tasksModifiedCount += 1;
    await user.save();

    res.status(200).json({ message: "Task deleted using lifeline." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



export {createTask,getTaskByUser,toggleTaskCompletion}