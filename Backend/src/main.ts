import express from "express"
import dotenv from "dotenv"
import { connectDb } from "./Config/database.js"
import { setupSwagger } from "./Config/swagger.js"
import router from "./Routing/routing.js"
import cookieParser from "cookie-parser"
const app=express()
app.use(express.json())
dotenv.config()
setupSwagger(app)

app.use(cookieParser())


app.use('/backend',router)
connectDb().then(()=>{
    app.listen(5000,()=>{
        console.log('server running on port 5000')
    })

}).catch((err:any)=>{
        console.log("Database connection failed:", err)
    })
