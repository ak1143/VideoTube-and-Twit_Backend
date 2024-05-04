import mongoose, {disconnect, isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponce} from "../utils/ApiResponce.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType} = req.query
    //TODO: get all videos based on query, sort, pagination

    const user=await User.findOne(
        {
            refreshToken:req.cookies.refreshToken
        }
    );

    if(!user){
        throw new ApiError(500,"something went wrong");
    }

    const sort = sortBy ? { [sortBy]: sortType === "desc" ? -1 : 1 } : {};

    const matchCretaria= query ? { title: { $regex : query ,$options : "i" } } : {}

    //--------rendering all videos of the users published-----

    // const videos=await Video.aggregate([
    //     {
    //     }
    // ])


    //-------this is for rendering the videos on the global site--

    const videos = await Video.aggregate([
        {
            $match:matchCretaria
        },
        {
            $skip: (Number(page) - 1) * Number(limit)
        },
        {
            $limit: parseInt(limit)
        },
        {
            $sort: sort
        },
        {
            $project:{
                id:1,
                videoFile:1,
                thumbnail:1,
                owner:1,
                title:1,
                description:1,
                duration:1,
                views:1,
                isPublished:1,
                createdAt:1,
                updatedAt:1
            }
        }
    ]);
    

    if(!videos){
        throw new ApiError(500,"something went wrong");
    }

    console.log(videos)

    return res
    .status(200)
    .json(
        new ApiResponce(
            200,
            {videos},
            "you have successfully fetched all videos"
        )
    );
    
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
    const { videoId } = req.params;
    //TODO: update video details like title, description, thumbnail
    const { title , description } =req.body;

    if(!isValidObjectId(videoId)){
        throw new ApiError(500,"the video is not available");
    }
    // Only the owner can update the video details
    const video= await Video.findById(videoId);
    if(!video){
        throw new ApiError(500,"ssss"); 
    }

    const user = await User.findOne({
        refreshToken: req.cookies.refreshToken,
    });
    if (!user) {
        throw new ApiError(404, "User not found")
    }

    if (!video.owner.equals(user._id.toString())) {
        throw new ApiError(403, "Only the owner can update video details")
    }

    if(!title.length>0 || !description.length>0){
        throw new ApiError(401,"all filed are manditory");
    }

    // console.log(req.file);
    const thumbnailPath= req.file?.path;
    // console.log(thumbnailPath);
    
    if(!thumbnailPath){
        throw new ApiError(401,"please upload the thumbnail");
    }

    const uploadthumbnailOnCloudinary = await uploadOnCloudinary(thumbnailPath);

    if(!uploadthumbnailOnCloudinary){
        throw new ApiError(500,"something went wrong while uploading the thumbnail on cloudinary");
    }

    const updatevideo= await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                thumbnail:uploadthumbnailOnCloudinary.url,
                title:title,
                description:description
            }
        },
        {
            new:true
        }
    );

    if(!updatevideo){
        throw new ApiError(500,"something went wrong");
    }

    return res
    .status(200)
    .json(
        new ApiResponce(
            200,
            {
                updateVideo
            },
            "the video details are updated successfully"
        )
    );
    
});

const deleteVideo = asyncHandler(async (req, res) => {
    //TODO: delete video
    const { videoId } = req.params;
    if(!videoId){
        throw new ApiError(400,"videoId can not be fetched from params")
    }
    
    const video = await Video.findById(videoId);
    console.log(video);
    if(!video){
        throw new ApiError(500,"didn't get the video");
    }

    const user = await User.findOne({
        refreshToken: req.cookies.refreshToken,
    })
    if (!user) {
        throw new ApiError(404, "User not found")
    }
    // console.log(user._id.toString());
    console.log(video); 
    //only the owner can delete the video
    if (video?.owner.equals(user._id.toString())) {
        await Video.findByIdAndDelete(videoId)
        return(
            res
            .status(200)
            .json(new ApiResponce(200,{},"Video deleted successfully"))
        );
    }else{
        throw new ApiError(401,"Only user can delete the video")
    }

});

const togglePublishStatus = asyncHandler(async (req, res) => {

    const { videoId } = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(500,"failed to get the video");
    }

    const video= await Video.findById(videoId);
    if(!video){
        throw new ApiError(400,"video is not found");
    }

    const user=await User.findOne(
        {
            refreshToken:req.cookies.refreshToken
        }
    );

    if(!user){
        throw new ApiError(500,"unable to get the user");
    }

    // only owner can change the publish_status of the video
    if(video?.owner.equals(user?._id.toString(videoId))){
        video.isPublished = !video.isPublished;
        await video.save({validateBeforeSave:false});

        return res
        .status(200)
        .json(
            new ApiResponce(
                200,
                video.isPublished,
                "video publish status toggled successfully"
            )
        )
    }else{
        throw new ApiError(500,"the user is not accessible to change the status");
    } 
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}