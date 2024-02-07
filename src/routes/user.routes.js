import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";


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

export default router;
