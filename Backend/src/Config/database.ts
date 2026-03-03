import mongoose from "mongoose";
export const connectDb = async (): Promise<void> => {
    try {
        let mongodb: string|undefined = process.env.MONGO_URI
        if (!mongodb) {
            throw new Error("MONGO_URI is not defined in .env")
        }
        await mongoose.connect(mongodb)
        console.log("connected to database")
    } catch (error) {
        console.log("Error detected", error)
    }
}