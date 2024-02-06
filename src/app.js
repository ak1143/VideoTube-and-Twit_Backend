import  express  from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app=express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

// for config and setting middlewares

app.use(express.json({limit:"18kb"}));
app.use(express.urlencoded({extended:true, limit:"18kb"}));
app.use(express.static("public"));
app.use(cookieParser());

// import routers
import userRouter from "./routes/user.router.js"

// routes declaration
app.use("/api/v1/users",userRouter);

export { app }  