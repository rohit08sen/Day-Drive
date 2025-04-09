import express from "express";
import connectDb from "./src/db/index.js";
import { app } from "./app.js";
import { User } from "./src/models/user.models.js";

// const app = express();
const regUser = async (req, res) => {
  const { username, email, password  ,fullname, dob, avatar} = req.body;
  console.log("email:", email);
  console.log("req files", req.files);
  console.log("Recieved req body:", req.body);

  const ruser = await User.create({
    fullname,
    email,
    password,
    username,
    dob,
    avatar,
  });
  console.log(ruser);
  return res.json(201, " created  : function completed");
};
app.post("/user", regUser);

connectDb().then(() => {
  app.listen(3000, () => {
    console.log("App is running on http://localhost:3000");
  });
});
