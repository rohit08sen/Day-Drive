import express from "express";
import connectDb from "./src/config/database.js";
import { app } from "./app.js";
import { User } from "./src/models/user.models.js";
import { signUp, signIn } from "./src/controllers/user.js";
import cookieParser from "cookie-parser";
import userRoutes from "./src/routes/user.js";

app.use(cookieParser());


app.use("/api/v1/user", userRoutes);

app.get("/", (req,res)=>{
  res.send("Server is running...");
});

connectDb().then(() => {
  app.listen(3000, () => {
    console.log("App is running on http://localhost:3000");
  });
});


