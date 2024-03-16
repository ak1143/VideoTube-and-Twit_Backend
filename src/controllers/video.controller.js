import mongoose, {disconnect, isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponce} from "../utils/ApiResponce.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body;
    // TODO: get video, upload to cloudinary, create video
    const user=await User.findOne(
        {
            refreshToken:req.cookies.refreshToken
        }
    );

    if(!user){
        throw new ApiError(400,"the user is not exists");
    }
    console.log(req.files);
    const videoFilePath=req.files?.videoFile[0]?.path;

    if(!videoFilePath){
        throw new ApiError(400,"something went wrong");
    }

    if(!title.length>0 || !description.length>0){
        throw new ApiError(401,"please write the title and description for the video");
    }

    const thumbnailPath = req.files?.thumbnail[0]?.path; 
    console.log(thumbnailPath);
    if(!thumbnailPath){
        throw new ApiError(500,"the thumbnail path is wrong");
    }

    const uploadthumbnail= await uploadOnCloudinary(thumbnailPath);

    if(!uploadthumbnail){
        throw new ApiError(500,"the thumbnail is not uploaded on cloudinary")
    }

    const video=await uploadOnCloudinary(videoFilePath);
    
    if(!video){
        throw new ApiError(400,"the video is not uploaded");
    }

    const VideoUploaded = await Video.create(
        {
            videoFile:video?.url,
            thumbnail:uploadthumbnail?.url,
            owner:user?._id,
            title:title,
            description:description,
            duration:video?.duration,
            isPublished:true
        }
    );

    if(!VideoUploaded){
        throw new ApiError(500,"somthing went wrong");
    }

    return res
    .status(200)
    .json(
        new ApiResponce(
            200,
            {
                VideoUploaded,
                uploadthumbnail
            },
            "video published successfully"
        )
    );

});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if(!isValidObjectId(videoId)){
        throw new ApiError(401,"the video is not available");
    }

    const video=await Video.findById(videoId);

    if(!video){
        throw new ApiError(400,"video is not exists any more");
    }

    return res
    .status(200)
    .json(
        new ApiResponce(
            200,
            {
                video
            },
            "the video is fetched successfully"
        )
    );

});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}