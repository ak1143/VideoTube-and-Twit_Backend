import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponce} from "../utils/ApiResponce.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { registerUser } from "./user.controller.js"

// TODO: toggle subscription
const toggleSubscription = asyncHandler(async (req, res) => {

    // step 1:get the channelId with the help of url
    const {channelId} = req.params
    console.log(req.params);
    // step 2: check the user is valid or not
    if(!isValidObjectId(channelId)){
        throw new ApiError(401,"cannot find the channel");
    }

    // now check the channel is exists or not
    const channel=await User.findById(channelId);

    if(!channel){
        throw new ApiError(400,"the user doesn't exists");
    }

    const user=await User.findOne({
        refreshToken:req.cookies.refreshToken
    });

    if(!user){
        throw new ApiError(400,"subscriber not exists");
    }

    const isUserSubscribed= await subscription.findOne({
        subcriber:user?._id,
        channel:channelId
    });

    if(isUserSubscribed){
        const unSubsribe=await subscription.findOneAndDelete({
            subcriber:user?._id,
            channel:channelId
        });

        if(!unSubsribe){
            throw new ApiError(400,"something went wrong");
        }

        return res
        .Status(200)
        .json(
            new ApiResponce(
                200,
                unSubsribe,
                "successfully unsubscribed the channel"
            )
        );
    };

    if(!isUserSubscribed){
        const subcribe = await subscription.create(
            {
                subcriber:user?._id,
                channel:channelId
            }
        );

        if(!subcribe){
            throw new ApiError(401,"somthing went wrong");
        }

        return res
        .Status(200)
        .json(
            new ApiResponce(
                200,
                subcribe,
                "you have successfully subscribed the channel"
            )
        )
    }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params;

    if(!isValidObjectId(channelId)){
        throw new ApiError(401,"the channel is not exists");
    }

    const channel = await User.findById(channelId);

    if(!channel){
        throw new ApiError(401,"the user doen not exists");
    }

    // get the subcribers
    const subscriber = await subscription.find(
        {
            channel:channel?._id
        }
    ).populate('subscriber');

    // get the subcriber count
    const subcribersCount=await subscription.countDocuments(
        {
            channel:channelId
        }
    );

    // return 
    return res
    .Status(200)
    .json(
        new ApiResponce(
            200,
            {subscriber,subcribersCount},
            "the subcribers retrived successfully"
        )
    )

});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {

    const { subscriberId } = req.params

    if(!isValidObjectId(subscriberId)){
        throw new ApiError(400,"the user does not exists");
    }

    const user=await User.findById(subscriberId);

    if(!user){
        throw new ApiError(401,"user does not exists");
    }

    const subscribedChannelList = await subscription.find(
        {
            subcriber:subscriberId
        }
    ).populate('channel');

    const subscribedChannelCount = await subscription.countDocuments(
        {
            subcriber:subscriberId
        }
    );

    return res
    .Status(200)
    .json(
        new ApiResponce(
            200,
            {subscribedChannelList,subscribedChannelCount},
            "successfully retrived the subcribed channel list"
        )
    );
    
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}