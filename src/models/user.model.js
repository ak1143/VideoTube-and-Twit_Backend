import mongoose,{Schema} from "mongoose";
import bcrypt from "bcrypt";
import  Jwt  from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";

// jwt is a bearer token

const userSchema=new Schema(
    {
        userName:{
           type:String,
           unique:true,
           required:true,
           trim:true,
           toLowercase:true,    
           index:true 
        },
        email:{
            type:String,
            unique:true,
            required:true,
            trim:true,
            lowecase:true, 
        },
        fullName:{
            type:String,
            required:true,
            trim:true,
            index:true
        },
        avatar:{
            type:String,  //cloudinary url
            required:true
        },
        coverImage:{
            type:String,  //cloudinary url
        },
        watchHistory:{
            type:Schema.Types.ObjectId,
            ref:"Video"
        },
        password:{
            type:String,
            required:[true,"the password is required"],
        },
        refreshToken:{
            type:String
        }
    },
    {
        timestamps:true
    }
)

// middleware using mongodb hooks-pre

userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next();

    try {
        this.password=await bcrypt.hash(this.password,10);
        next();
    } catch (error) {
        throw new ApiError(500,"the error occured at assigning password");
    }
});

// check password

userSchema.methods.isPasswordCorrect = async function(password) {
        return await bcrypt.compare(password, this.password);
}


// to generate the accesstokens

userSchema.methods.generateAccessTokens=function(){
    return Jwt.sign(
        {
            _id:this._id,
            email:this.email,
            userName:this.userName,
            fullName:this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

// to generate the refreshtoken

userSchema.methods.generateRefreshTokens=function(){
    return Jwt.sign(
        {
            _id:this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User=mongoose.model('User',userSchema);