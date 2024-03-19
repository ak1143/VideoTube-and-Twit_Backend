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

});

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
    const {commentId}=req.params;
    console.log(req.params);
    if (!commentId) {
        throw new ApiError(400,"Cannot find comment id")
    }

    const comment=await Comment.findById(commentId);
    //validating if the user is the one updating the comment
    const user = await User.findOne({
        refreshToken: req.cookies.refreshToken,
    });

    if (!user) {
        throw new ApiError(404, "User not found")
    }
    console.log(comment);
    console.log(comment?.owner);
    console.log(user?._id);

    if(comment?.owner.equals(user?._id.toString())){
        const {content}=req.body
        if (!content) {
            throw new ApiError(400,"Content is required")
        }

        //updating the comment 
        comment.content=content
        await comment.save({validateBeforeSave:false})

        return(
            res
            .status(200)
            .json(new ApiResponce(200,comment,"comment updated successfully"))
        );
    }else{
        throw new ApiError(400,"Only the owner can update the comment")
    }

});

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment

    const { commentId } =req.params;
    console.log(commentId);

    if(!isValidObjectId(commentId)){
        throw new ApiError(500,"the comment is not available");
    }

    // step 1: take the access of the logined user
    const user= await User.findOne(
        {
            refreshToken:req.cookies.refreshToken
        }
    );

    if(!user){
        throw new ApiError(500,"you must need to logedin first");
    }

    // step 2: comapare the commented owner to the login-user
    //         if those are same then only allow the user to delete the comment
    
    const commented = await Comment.findById(commentId);
    console.log(commented);

    if(!commented){
        throw new ApiError(500,"something went wrong");
    }

    if(commented?.owner.equals(user?._id.toString())){

        await Comment.findByIdAndDelete(commentId);

        return res
        .status(200)
        .json(
            new ApiResponce(
                200,
                {},
                "successfully deleted the comment"
            )
        );

    }else{
        throw new ApiError(300,"you are not allowed to delete the comment");
    }

});

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}