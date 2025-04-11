import mongoose from "mongoose";

const connectDb = async () => {
  await mongoose.connect("mongodb+srv://daydrive:daydrive123@cluster0.127ur7o.mongodb.net/DayDrive")
  .then(() => console.log("DB Connected Successfully"))
  .catch( (error) => {
      console.log("DB Connection Failed");
      console.error(error);
      process.exit(1);
  } )
};

export default connectDb