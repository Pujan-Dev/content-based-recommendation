import mongoose from "mongoose";

export const connectDb = async (): Promise<void> => {
  try {
    const mongodb: string | undefined = process.env.MONGO_URI;
    if (!mongodb) {
      throw new Error("MONGO_URI is not defined in .env");
    }
    await mongoose.connect(mongodb);
    console.log("connected to database");
  } catch (error) {
    console.log("Error detected", error);
  }
};

export const DB_CONFIG = {
  database: process.env.MONGODB_DATABASE,
  postsCollection: process.env.MONGODB_POSTS_COLLECTION,
  usersCollection: process.env.MONGODB_USERS_COLLECTION,
};
