import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponce} from "../utils/ApiResponce.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { app } from "../app.js"

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

    const { content }=req.body;
    const { tweetId }=req.params;
    console.log(content);
    console.log(tweetId);

    if(!isValidObjectId(tweetId)){
        throw new ApiError(500,"something went wrong");
    }
    const tweet=await Tweet.findById(tweetId);

    if(!tweet){
        throw new ApiError(400,"there is no any tweeet");
    }

    const user= await User.findOne(
        {
            refreshToken:req.cookies.refreshToken
        }
    );

    if(!user){
        throw new ApiError(500,"u need to login first");
    }

    if(!content.length>0){
        throw new ApiError(300,"you need to provide the content for the updation of tweet");
    }

    // authenticate that the old comment user and login user is same
    // then only update the content.

    if(tweet.owner.equals(user._id.toString())){
        tweet.content=content
        tweet.save()
        
        return res
        .status(200)
        .json(
            new ApiResponce(
                200,
                {tweet},
                "you have completely updated the tweet"
            )
        );
    }else{
        throw new ApiError(400,"you are not allowd to update the tweet");
    }
    
    
});

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params;

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"you need to login first");
    }

    const user=await User.findOne(
        {
            refreshToken:req.cookies.refreshToken
        }
    );

    if(!user){
        throw new ApiError(500,"somthing went wrong");
    }

    const tweet=await Tweet.findById(tweetId);
    
    if(!tweet){
        throw new ApiError(500,"tweetId is not found");
    }

    if(tweet.owner.equals(user._id.toString())){
        await Tweet.findByIdAndDelete(tweetId);
        
        return res
        .status(200)
        .json(
            new ApiError(
                200,
                {},
                "you have successfully deleted a tweet"
            )
        );
    }else{
        throw new ApiError(300,"you are not allowed to delete a tweet");
    }

});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}