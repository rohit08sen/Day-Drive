import mongoose from "mongoose";
import { Schema } from "mongoose";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique:true,
    },
    fullname: {
      type: String,
    },
    password: {
      type: String,
      required:[true,"Password is Required"]
    },
    email: {
      type: String,
      unique:true,
    },
    dob: {
      type: String,
      
    },
    avatar: {
      type: String,
      required:false,
    },
    date: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"Date"
    }
    
  },
  {timestamps:true}
)

export const User=mongoose.model("User",userSchema)