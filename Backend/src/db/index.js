import mongoose from "mongoose";

const connectDb = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGO_URL, {
      dbName:"Day_Drive"
    })
    console.log(
      `MongoDb Connected!!! DB HOST:${connectionInstance.connection.host}`
    );
  } catch (error) {
     console.log("MonogoDb connection Error", error);
     process.exit(1);
  }
}

export default connectDb;