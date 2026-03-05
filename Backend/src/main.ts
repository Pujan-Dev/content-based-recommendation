import dotenv from "dotenv"
dotenv.config()

import express from "express"
import cookieParser from "cookie-parser"
import cloudinary, { initCloudinary } from "./Config/cloudinary.js"
import { connectDb } from "./Config/database.js"
import { setupSwagger } from "./Config/swagger.js"
import router from "./Routing/routing.js"
import userRouter from "./Routing/userRouting.js"
import postRouter from "./Routing/postRouting.js"
import feedRouter from "./Routing/feedRouting.js"

initCloudinary()

const app=express()
app.use(express.json())
app.use(cookieParser())

setupSwagger(app)

app.use('/backend',router)
app.use("/user", userRouter)
app.use("/post", postRouter)
app.use("/feed", feedRouter)


connectDb().then(()=>{
    app.listen(5000,()=>{
        console.log('server running on port 5000')
    })

}).catch((err:any)=>{
        console.log("Database connection failed:", err)
    })
