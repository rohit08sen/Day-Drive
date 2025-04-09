import mongoose from "mongoose";

const connectDb = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/user")
    console.log("Db connected");

  } catch (error) {
    console.log("Db connection error",error)
  }
}

export default connectDb;