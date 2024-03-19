import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponce} from "../utils/ApiResponce.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } =req.body;

    if(!content.length>0){
        throw new ApiError(300,"content is manditory");
    }
    
    const user= await User.findOne(
        {
            refreshToken:req.cookies.refreshToken
        }
    );

    if(!user){
        throw new ApiError(400,"please singin to make a tweet");
    }

    const tweet=await Tweet.create(
        {
            content:content,
            owner:user._id
        }
    );

    if(!tweet){
        throw new ApiError(500,"something went wrong");
    }

    return res
    .status(200)
    .json(
        new ApiResponce(
            200,
            {tweet},
            "you have successfully made a tweet"
        )
    );

});

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
});

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
});

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}