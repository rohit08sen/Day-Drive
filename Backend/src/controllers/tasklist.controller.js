import { TaskList } from "../models/tasklist.models.js";
import { Task } from "../models/task.models.js";
import { User } from "../models/user.models.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { ErrorHandler } from "../middlewares/error.js";

//helper to check if dates are in same month or not for the lifeline
const isSameMonth = (date1, date2) =>
  date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth();

/*🧠 Why it's used in your app:
In your DayDrive app, each user is allowed to create or modify their TaskList only 2 times per month using "lifelines". So:

You store the last time they modified a list in lastModifiedReset.

Each time they try to create a new task list, you check:

👉 If the current date is in the same month as lastModifiedReset

✅ If yes: Don't reset tasksModifiedCount

❌ If no: Reset the counter to 0

That check is exactly what isSameMonth(date1, date2) is doing.*/
/* Method	     Returns	   Example
.getFullYear()	2025	     new Date("2025-04-10")
.getMonth()	3 (for April)	 same date*/

//1. Creating TaskList (With life line Check)
 const createTaskList = asyncHandler(async (req, res, next) => {
  const { tasks } = req.body;
  const userId = req.user._id; //from auth middle ware
  const today = new Date();
  if (!Array.isArray(tasks) || tasks.length === 0) {
     return next(new ErrorHandler("Tasks array is required", 400));
  }
  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorHandler("User doesn't exist", 400));
  }

  //Reset monthly lifelines if it's a new month
  if (!isSameMonth(user.lastModifiedReset, today)) {
    user.tasksModifiedCount = 0;
    user.lastModifiedReset = today;
  }

  //check if user still has lifelines left
  if (user.tasksModifiedCount >= 2) {
    return res
      .status(403)
      .json({ message: "You’ve used all 2 task list lifelines this month." });
  }

  //check if TaskList already exists today
  const existingList = await TaskList.findOne({
    user: userId,
    date: {
      $gte: new Date(today.setHours(0, 0, 0, 0)),
      $lt: new Date(today.setHours(23, 59, 59, 999)),
    },
  });

  /*

    MongoDB operator	Meaning
      $gte	Greater than or equal
      $lt	Less than
      We're saying:Give me any TaskList from today, between 00:00:00 and 23:59:59.999

      ---------
      {
        user: "abc123",
        date: {
          $gte: new Date("2025-04-10T00:00:00.000Z"),
          $lt:  new Date("2025-04-10T23:59:59.999Z")
        }
      }
      
      All together, this query checks:

      🔍 “Did this user already create a task list today?”

      If yes — you block them from creating another one ✅

  */
  if (existingList) {
    return next(
      new ErrorHandler("You’ve already set a task list for today.", 400)
    );
  }
  //create tasks
  const taskDocs = await Task.insertMany(
    tasks.map((t) => ({
      ...t,
      user: userId,
    }))
  );
  /*
    You're receiving an array of tasks (probably from the frontend), and for each task:

    You attach the current userId to it (so we know who owns it)

    Then insert all tasks at once into your MongoDB database using Task.insertMany()

    ✅ What is ...t?
    This is called the spread operator. It’s used to copy all key-value pairs from t (each task object) into the new object.

    🎯 Why it's useful here
    You’re taking every field sent from the frontend (like task, priority, etc.) as-is, and then you're adding the user field to it.


  */
  //create taskList
  const taskList = await TaskList.create({
    user: userId,
    tasks: taskDocs.map((t) => t._id),
    date: new Date(),
  });

  //update lifeline usage
  user.tasksModifiedCount += 1;
  await user.save();

  return res.status(201).json({
    message: "TaskList Created Successfully",
    data: taskList
  });

 })


//2.Get Tasklist By Date
/*🔥 Why you need this:
      Your app is date-based. Users create daily task lists and want to:

      Use Case	Why it's Needed
      📅 Open the app and see today’s list	Automatically show today's goals
      ⏪ View past task lists	See progress/streaks/history
      📈 Track performance over time	Show analytics like “You completed 80% last week”
🧪 Compare days	For review or productivity checks
*/ 

const getTaskListByDate = asyncHandler(async (req, res, next) => {
  const { date } = req.params;
  const userId = req.user._id;
  const dayStart = new Date(date);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  //find the task list
  const taskList = await TaskList.findOne({
    user: userId,
    date: { $gte: dayStart, $lte: dayEnd },
  }).populate("tasks");

  if (!taskList) {
    return res
      .status(404)
      .json({ message: "No task list found for that day." });
  }
  return res
    .status(201)
    .json({
      success: true,
      message: "Task list fetched",
      date: taskList
    });
})

//3.Get All TaskLists(for heatmap)
const getAllTaskListForUser = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const taskLists = await TaskList.find({
    user: userId,
  }).select("date percentageCompleted");

  if (!taskLists) {
    return res
      .status(404)
      .json({ message: "No task list found for that day." });
  }
  return res.status(201).json({
    success: true,
    message: "Task list fetched",
    date: taskLists,
  });
})
/*
    📍 What’s the purpose?
    This route gets all task lists of a user, grouped by date — so you can build things like:

    Feature	What it shows
    🔥 Productivity heatmap	Show which days had activity
    📆 Calendar view	Highlight days with completed task lists
    📈 Streaks & consistency	How many days in a row did they complete tasks?
    ✅ Daily check-ins	Marked as “done” on a day, even if just 1 task
    🎯 Progress stats	% completion over weeks/months
*/

//4.recalculate tasklist completetion

const recalculateTaskListCompletion = asyncHandler(async (taskListId) => {
  const taskList = await TaskList.findById(taskListId).populate("tasks");

  if (!taskList || taskList.tasks.length === 0) return;

  const total = taskList.tasks.length;
  const completed = taskList.tasks.filter((t) => t.completed).length;

  taskList.percentageCompleted = Math.round((completed / total) * 100);

  await taskList.save();

})


//5.reset monthly lifelines(cron job)
const resetMonthlyLifelines = asyncHandler(async () => {
  const now = new Date();
  const users = await User.updateMany(
    {},
    {
      tasksModifiedCount: 0,
      lastModifiedReset:now,
    }
  )
  console.log(`[Cron] Reset lifelines for ${users.modifiedCount} users`);
})

/*
  Yes! With everything we've discussed, your **TaskList controller** is pretty much **fully complete and functional**. ✅ Let's quickly summarize everything it should cover and confirm you're good to go:

---

## ✅ **Your TaskList Controller Handles:**

      ### 🔹 1. **Create TaskList (with lifeline limits & daily limit)**
      - Checks if the user already created one today.
      - Checks if they used both lifelines this month.
      - Creates a new TaskList with tasks.
      - Increments `tasksModifiedCount`.

      ### 🔹 2. **Get TaskList by Date**
      - Allows the user to fetch a TaskList by a specific day.
      - Useful for showing today's list or history.

      ### 🔹 3. **Get All TaskLists (Heatmap View)**
      - Lets you fetch all task lists created by a user.
      - Used to build a heatmap/calendar UI.

      ### 🔹 4. **Recalculate TaskList Completion**
      - Recalculates `percentageCompleted` when a task is updated.
      - Called from task controller when `task.completed` changes.

      ### 🔹 5. **Monthly Lifeline Reset (Cron Job)**
      - Resets `tasksModifiedCount` on the 1st of each month.
      - Keeps users limited to 2 TaskList changes/month.

---

## 🧠 Optional Enhancements You Might Add Later:

      - **Delete a TaskList** (soft delete?)
      - **Edit Tasks inside a TaskList** (careful — may affect lifeline count)
      - **Prevent backdated TaskLists** (so users don’t cheat by adding old ones)
      - **Lock TaskList once the day is over?** (depends on app rules)

---

### ✅ So yes — if you’ve got these controllers wired in and tested, your **TaskList flow is complete!**  
Let me know if you want a full list of all controller functions written out cleanly in a file — happy to give you a clean copy!
*/ 
export {createTaskList,getTaskListByDate,getAllTaskListForUser,recalculateTaskListCompletion,resetMonthlyLifelines}




