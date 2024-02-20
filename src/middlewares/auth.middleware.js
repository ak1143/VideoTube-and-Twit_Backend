import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";


export const verifyJWT = asyncHandler(async(req,_,next)=>{

    try {
        // because of cookieParser we have access of req.cookie
        const token = req.cookie?.accessToken || req.header
        ("Authorization")?.replace("Bearer ","");
    
        if(!token){
            throw new ApiError(401,"Unothorized request");
        }
    
        const decodedToken = jwt.verify(token ,process.env.ACCESS_TOKEN_SECRET)
        
        const user=await User.findById(decodedToken?._id).select("-password -refreshToken");
    
        if(!user){
            // TODO :discuss about frontend
            throw new ApiError(401,"Invalid Access Token")
        }

        // add new property to req object 
        req.user = user ;
        next();

    } catch (error) {
        throw new ApiError (401,error?.message || "Invalid accessToken");
    }
});