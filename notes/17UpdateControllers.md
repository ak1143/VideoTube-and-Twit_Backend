add subscription schema
```js
import mongoose,{Schema} from "mongoose";

const subcriptionschema=new Schema({
    subcriber:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    channel:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
    },
    {timestamps:true}
);

export const subcription=mongoose.model("subcription",subcriptionschema);

```

in user.controller.js add changeCurrentPassword function
```js
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
```
then add function to get current User
```js
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
```
then add function to update users account details

**Advice** - make a seperate controller for updating files like img or videos, to avoid network congestion

`{new: true}` = update hone ka baad jo information miltihai vo return hoti hai
```js
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
                fullName,
                email
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
```
then add a function to update user avatar and simillarly coverImage
```js
const updateUserAvatar = asyncHandler ( async(req,res)=>{

    // step 1: take files path 
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

    // step 5: update the avatar field
    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar : avatar.url
            }
        },
        { new : true }
    ).select("-password");

    // step 6 :return a responce to the user
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
```
