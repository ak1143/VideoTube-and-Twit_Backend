// require('dotenv').config({path: './env'})
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./db/index.js";
import {app} from "./app.js"
dotenv.config({
    path:'./env'
})

connectDB()
.then(()=>{
    app.on("error",(err)=>{
        console.log("Error : occured in promises ",err);
    })
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`server is running at ${process.env.PORT}`);
    }
    )
})
.catch((err)=>{
    console.log("MONGO_DB connection failed !!!",err);
})












/*
import { Express } from "express";
// import { DB_NAME } from "./constants";
const app=Express()

(async()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("Error: ",error);
            throw error
        })

        app.listen(process.env.PORT,()=>{
            console.log(`App is listening on port ${process.env.PORT}`);
        })

    } catch (error) {
        console.log("Error: ",error)
        throw error
    }
})()
*/