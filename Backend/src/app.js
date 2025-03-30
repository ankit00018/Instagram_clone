import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser"; // Optional but helps

const app = express();


app.use(cors({
    origin:["http://localhost:5173"], 
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With' // Add this
      ],
      exposedHeaders: ['Authorization'], // Optional but recommended
      maxAge: 86400, // Cache preflight for 24h
    credentials: true,
})),

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(bodyParser.json());  // Optional

// import router

import userRouter from "./routes/user.route.js";
import postRouter from "./routes/post.route.js";
import propertyRouter from "./routes/property.route.js"
import messageRouter from "./routes/message.route.js";
import storyRouter from "./routes/story.route.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/post", postRouter);
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/property", propertyRouter);
app.use("/api/v1/stories", storyRouter);

export { app };


