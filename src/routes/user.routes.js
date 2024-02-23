import { Router } from "express";
import { loginUser, registerUser ,logoutUser ,RefreshAccessTokens} from "../controllers/user.controller.js";
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
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/refresh-Token").post(RefreshAccessTokens);

export default router;
