import { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponce} from "../utils/ApiResponce.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"


const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId}= req.params
    const {content}=req.body;

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"this video is not available");
    }

    if(!content){
        throw new ApiError(401,"content is required");
    }

    const video= await Video.findById(videoId);

    if(!video){
        throw new ApiError(400,"something went wrong");
    }

    const user= await User.findOne(
        {
            refreshToken:req.cookies.refreshToken
        }
    );

    if(!user){
        throw new ApiError(400,"you need to signin || user is not found");
    }

    const comment= await Comment.create(
        {
            content:content,
            video:video?._id,
            owner:user?._id
        }
    );

    if(!comment){
        throw new ApiError(400,"something went wrong");
    }

    return res
    .status(200)
    .json(
        new ApiResponce(
            200,
            {comment},
            "you have successfully commentd on video"
        )
    );

});

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}