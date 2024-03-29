
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponce } from "../utils/ApiResponce.js" 
import jwt from "jsonwebtoken";
import mongoose from "mongoose"

const generateAccessAndRefreshTokens = async(userId)=>{
    try {
        
        const user = await User.findById(userId);
        const accessToken = user.generateAccessTokens();
        const refreshToken = user.generateRefreshTokens();

        // save the refereshtokens to the database.
        user.refreshToken = refreshToken 
        // save and avoid password checks
        await user.save({ validateBeforeSave : false});

        return {refreshToken ,accessToken};

    } catch (error) {
        throw new ApiError(500,"something went wrong while generating access and refresh tokens");
    }
};

const registerUser = asyncHandler( async (req,res)=>{
    
    /*
    steps for user registration:-
        1.  get the user details from the frontend.
        2.  validation- not empty.
        3.  check if user exist : username,email.
        4.  check for images,check for avatar.
        5.  upload the images on cloudinary,upload (check the) avatar.
        6.  create a user object-create entry in db.
        7.  remove password and refreshTokend from the responce.
        8.  check for user creation
        9.  return responce.
    */

//  Step 1:

    const {fullName,email,userName,password}=req.body
//  console.log("email",email);

// Step :Middleware.

    // before going to the next step you need to introduce middlware 
    // in order to save the avatar and coverImage.

//  Step 2:

    /* 1st way to validate the information
       check the readme file:-14LogicBuilding.
    */

    // 2nd way || optimalway to validate the information
    
    if(
        [ fullName , email , userName , password ].some( (field) => field?.trim() === "")
    ){
        throw new ApiError(400,"all fields are required");
    }

//  Step 3:

    const existedUser=await User.findOne({
        $or:[{userName},{email}]
    });

    if(existedUser){
        throw new ApiError(409,"user with this email or username exists please enter another");
    }

    console.log(req.files);

//  Step 4:
    
    const avatarLocalPath=req.files?.avatar[0]?.path;
    // const coverImageLocalpath=req.files?.coverImage[0]?.path;

    let coverImageLocalpath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0)
    {
        coverImageLocalpath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath){
        throw new ApiError(404,"avatar is required avatarpath");
    }

//  Step 5:

    const avatar=await uploadOnCloudinary(avatarLocalPath);
    const coverImage=await uploadOnCloudinary(coverImageLocalpath);
    
    if(!avatar){
        throw new ApiError(404,"avatar is required");
    }

//  Step 6:

    const user=await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        userName:userName,
    });

//  Step 7:
    
    const createdUser= await User.findById(user._id).select(
        "-password -refreshToken"
    );

//  Step 8:

    if(!createdUser){
        throw new ApiError(500,"something went wrong while registring the user");
    }

//  Step 9:
    
    return res.status(201).json(
        new ApiResponce(200,createdUser,"User registered Successfully")
    )

});

const loginUser = asyncHandler(async (req,res)=>{
    
    /*steps for user login:-

        1. fetch data from req body
        2. check if username or email present
        3. find the username with matching username/email
        4. password check - use user which is User instance to access isPasswordCorrect method and not User
        5. generate access and refresh token - this is so common, we create a seperate function as it will be used many times
        6. send cookie and response

    */

    //  1. fetch data from req body.
    const {email,userName,password} = req.body

    // 2. check if username or email present
    // if(!(userName || email )){
    //     throw new ApiError(400,"username or password is required");
    // }
    if(!userName && !email ){
        throw new ApiError(400,"username or password is required");
    }
    if(!password){
        throw new ApiError(400,"the pass is not defined");
    }

    //  3. find the username with matching username/email
    const user= await User.findOne({
        $or : [ {userName} , {email} ] 
    });

    if(!user){
        throw new ApiError(404,"User does not exit");
    }

    //  4. password check 
    console.log(userName+email);
    console.log("pass"+password);
    const isPasswordValid = await user.isPasswordCorrect(password);  

    if(!isPasswordValid){
        throw new ApiError(401,"Invalid user credentials");
    }

    //   5. generate access and refresh token
    const { refreshToken , accessToken} = await generateAccessAndRefreshTokens(user._id);

    // by using findOne there comes unwanted part such as password so remove it
    // 6. send cookies and responce
    const logedInuser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly :true,
        secure :true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponce (
            200,
            {
                // why are we sending accestokens and refreshTokens in cookie as well as responce  
                user : logedInuser,
                refreshToken,
                accessToken
            },
            "user logedIn successfully"
        )
    );
});

const logoutUser = asyncHandler ( async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set :{
                // remove refreshToken
                refreshToken : 1 //before there is refreshToken :undifined
            }
        },
        {
            // return new value not old
            new :true
        }
    )

    const options = {
        httpOnly :true,
        secure : true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponce(200),{},"User logged out");

});

const RefreshAccessTokens = asyncHandler( async(req,res)=>{

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized Request");
    }

    try {
        const decodedToken=jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );
    
        const user= await User.findById(decodedToken?._id);
    
        if(!user){
            throw new ApiError(401,"Invalid refreshToken");
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,"refresh token is expired or used");
        }
    
        const options={
            httpOnly:true,
            secure:true
        }
    
        const {accessToken,newrefreshToken} = await generateAccessAndRefreshTokens(user._id);
    
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newrefreshToken,options)
        .json(
            new ApiResponce(
                200,
                {accessToken,refreshToken:newrefreshToken},
                "accessToken refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message ||"Invalid refresh token");
    }

});

const changeCurrentPassword = asyncHandler( async(req,res)=>{
    // step 1: take the manditory fileds in order to update password
    const {oldPassword,newPassword}=req.body

    // step 2:check the oldPassword is correct or not
    const user= await User.findById(req.user?._id);

    // step 3:check the old password is correct or not
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    // step 4:validation 
    if(!isPasswordCorrect){
        throw new ApiError("the password is wrong");
    }

    // step 5: save the password
    user.password=newPassword;
    await user.save({validateBeforeSave : false});

    // step 6: return responce
    return res
    .status(200)
    .json( new ApiResponce(200,{},"password changed successfully!"));
});

const getCurrentUser = asyncHandler (async(req,res)=>{
    return res
    .status(200)
    .json(
        new ApiResponce(
            200,
            req.user,
            "current user is fetched successfully!"
        )
    )
});

const updateAccountDetails = asyncHandler ( async(req,res)=>{

    // step 1:take the details that needs to be updated
    const {fullName,email} = req.body

    // step 2:check the fullname and email is entered by the user
    if(!fullName || !email){
        throw new ApiError(401,"All fields are manditory");
    }

    // step 3:search user and update the fields
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName :fullName,
                email :email
            }
        },
        {new :true} // the informaiton which is being updated that is returned 
    ).select("-password");

    // step 4: return responce
    return res
    .status(200)
    .json(
        new ApiResponce
        (
            200,
            user,
            "Account details are updated"
        )    
    )
});

const updateUserAvatar = asyncHandler ( async(req,res)=>{

    // step 1: take files path 
    console.log("hello"+req.files);
    const avatarLocalPath = req.file?.path

    // step 2: check the file path is there or not
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is missing");
    }

    // step 3: upload on clodinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    // step 4: check the avatar is uploaded or not
    if(!avatar.url){
        throw new ApiError(400,"The avatar is not uploded on cloudinary");
    }

    /* To do :Assignment for deleting the old avatar image
    // step 5: delete the old avatar image
    await User.findByIdAndDelete(
        req.user?._id,
        {
            $or :[
                { avatar : avatar.url }
            ]
        }
    );
    */

    // step 6: update the avatar field
    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar : avatar.url
            }
        },
        { new : true }
    ).select("-password");

    // step 7 :return a responce to the user
    return res
    .status(200)
    .json(
        new ApiResponce
        (
            200,
            user,
            "Successfully updated the avatar"
        )
    );
});

const updateUserCoverImage =asyncHandler( async(req,res)=>{

    // step 1: take the path of the file
    const coverImageLocalpath =req.file?.path

    // step 2:check the cover image is present or not 
    if(!coverImageLocalpath){
        throw new ApiError(400,"the cover image is not uploaded");
    }

    // step 3:upload it on cloudinary
    const coverImage =await uploadOnCloudinary(coverImageLocalpath);

    // step 4: check if the image is uploaded or not
    if(!coverImage){
        throw new ApiError(400,"the image is not uploaded on cloudinary");
    }

    // To do: assignment delete the old coverImage

    // step 6: update the coverImage field
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage :coverImage.url
            }
        },
        { new : true }
    ).select("-password");

    // step 7: return responce
    return res
    .status(200)
    .json(
        new ApiResponce
        (
            200,
            user,
            "the coverImage is updated successfully!"
        )
    )

});

const getUserChannelProfile = asyncHandler( async(req,res)=>{

    // console.log(req.params);
    // step 1: get the username of channel with the help of url
    const { username:userName } = req.params
    console.log(req.params);
    console.log(typeof(req.params));
    if(!userName?.trim()){
        throw new ApiError(400,"username is missing");
    }

    // step 2: write the aggregate pipelines in oerder to calculate 1. the subcribers of channel 2.all channels subscribed by the user
    const channel = await User.aggregate([
        {
            // stage 1 : for matching all documents that contains same username as provided.
            $match :{
                userName : userName?.toLowerCase()
            }
        },
        {
            // stage 2 : joins the documents in order to calculate the count of subcribers for a channel
            $lookup:{   // it is used in order to join the documents
                from :"subcriptions",
                localField:"_id",
                foreignField:"channel",
                as :"subcribers"
            }
        },
        {
            // stage 3: joins the documents in order to calculate the count of channels that is subcribed by the user
            $lookup:{
                from:"subcriptions",
                localField:"_id",
                foreignField:"subcriber",
                as:"subcribedTo"
            }
        },
        {
            // stage 4: the stage is for adding fields to the responce(DB) as the subscribers count and subcribedTo count 
            $addFields:{

                subcribersCount:{ 
                    $cond: [
                        { $isArray: "$subcribers" }, 
                        { $size: "$subcribers" }, 0
                    ]
                },

                ChannelsSubcribedToCount: { 
                    $cond: [
                        { $isArray: "$subcribedTo" }, 
                        { $size: "$subcribedTo" }, 0
                    ] 
                },

                // subcribersCount:{
                //     $size:"$subcribers"
                // },

                // ChannelsSubcribedToCount:{
                //     $size:"$subcribedTO"
                // },

                isSubcribed:{
                    $cond: {
                        if : { $in: [req.user?._id ,  "$subcribers.subcriber"]},
                        then : true,
                        else : false
                    }
                }
            }
        },
        {
            // stage 5: for return responce
            $project :{
                fullName : 1,
                userName : 1,
                email : 1,
                avatar : 1,
                coverImage : 1,
                subcribersCount : 1,
                ChannelsSubcribedToCount : 1,
                isSubcribed : 1
            }
        }
    ]);
    
    if(!channel?.length){
        throw new ApiError(404,"channel deos not exit");
    }

    return res
    .status(200)
    .json ( new ApiResponce(200,channel[0],"the channel fetched successfully!"));

});

const getWatchHistory = asyncHandler( async(req,res)=>{
    
    // In order to get the watch history of channel the watchhistory is present in user document.
    // The watch history is calculated with the help of videos id so the aggeregation(joining of documents) must be done.
    const user = await User.aggregate([
        {
            // stage 1: match or select the fields that needs to be aggregate
            $match:{
                _id : new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            // stage 2: write a aggregate pipeline to join the document user and video
            $lookup :{
                from :"videos",
                localField : "watchHistory",
                foreignField : "_id",
                as :"watchHistory",
                // again the field owner in the document video is related to the user so that's why the nexted pipelines need to be declared
                // also called as sub-pipelines.
                pipeline : [
                    {
                        $lookup :{
                            from :"user",
                            localField :"owner",
                            foreignField :"_id",
                            as :"owner",
                            pipeline :[
                                {
                                    $project :{
                                        fullName : 1,
                                        email :1,
                                        avatar :1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        // this stage or field addfield is declared in oreder to provied a well-strutured db to the front-end
                        // the result of above pipelines is in the form of array and in oerder to get the info from the array is quiet time taking
                        // the easy way to provide that [0] field in the array direct to the document.
                        // that's why the addfield is intorduced.
                        $addFields :{
                            // $first - it gives the firest element from the returend array.
                            owner :{
                                $first : "$owner" 
                            }
                        }
                    }
                ]
            }
        }
    ]);
    
    console.log(user);

    return res
    .status(200)
    .json(
        new ApiResponce(
            200,
            user[0].watchHistory,
            "watch history fetched successfully"
        )
    );
});

export {
    registerUser,
    loginUser,
    logoutUser,
    RefreshAccessTokens,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
};