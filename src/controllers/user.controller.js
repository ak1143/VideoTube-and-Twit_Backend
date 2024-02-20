
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponce } from "../utils/ApiResponce.js" 

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
        throw new ApiError(404,"avatar is required avtarpath");
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
                refreshToken :undefined
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

export {
    registerUser,
    loginUser,
    logoutUser
};