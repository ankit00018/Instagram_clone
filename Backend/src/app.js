import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin:process.env.CORS_ORIGIN || "http://localhost:5173", 
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Set-Cookie"],
    credentials: true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true, limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser());


// import router 

import userRouter from "./routes/user.route.js"
import postRouter from "./routes/post.route.js"
import messageRouter from "./routes/message.route.js"


app.use("/api/v1/users",userRouter)
app.use("/api/v1/post",postRouter)
app.use("/api/v1/message",messageRouter)


export {app}

