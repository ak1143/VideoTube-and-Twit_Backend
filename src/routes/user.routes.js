import { Router } from "express";
import { 
    loginUser, 
    registerUser ,
    logoutUser ,
    RefreshAccessTokens,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory

    } from "../controllers/user.controller.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router();

router.route("/register").post(
    upload.fields(
        [
            {
                // name of the fields
                // should be same at fronend
                // this communication should be there between
                // backedn and frontend developer
                name:"avatar",
                maxCount:1
            },
            {
                name:"coverImage",
                maxCount:1
            }
        ]
    ),
    registerUser
    );

router.route("/login").post(loginUser);

// secured routes

router.route("/logout").post( verifyJWT , logoutUser);

router.route("/refresh-Token").post( RefreshAccessTokens);

router.route("/change-password").post( verifyJWT ,changeCurrentPassword);

router.route("/current-user").get( verifyJWT ,getCurrentUser);

router.route("/update-Account").patch( verifyJWT ,updateAccountDetails)

router.route("/update-avatar").patch( verifyJWT ,upload.single("avatar"), updateUserAvatar)

router.route("/update-coverImage").patch(verifyJWT ,upload.single("coverImage"), updateUserCoverImage)

router.route("/c/:username").get(verifyJWT , getUserChannelProfile)

router.route("/watch-history").get(verifyJWT, getWatchHistory);

export default router;
