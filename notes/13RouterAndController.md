in controller , user.controller.js
```js
import { asyncHandler } from "../utils/asyncHandler.js"

const registerUser = asyncHandler( async (req,res)=>{
     res.status(200).json({
        message:"ok"
    });
});

export {registerUser};
```
in app.js add route- 
```js
app.use("/api/v1/users",userRouter);
```
in routes user.routes.js
```js
import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
const router=Router();

router.route("/register").post(registerUser);

export default router;

```

![postman](/notes/images/postman.png)

ISSUE I was facing - In index.js i did not import app, instead i was running it other express server


1. **Routers:**
   - **Definition:** Routers are components in a web application that handle the incoming requests and direct them to the appropriate controllers based on the requested URL or route.
   - **Functionality:** Routers act as traffic managers, determining which part of the application should handle a specific request. They analyze the URL and send the request to the corresponding controller for further processing.
   - **Use Case:** In an Express.js application, routers define the routes and are responsible for organizing the different parts of the application. They help maintain a clean structure and separate concerns by directing requests to specific controllers.

2. **Controllers:**
   - **Definition:** Controllers are components in a web application that contain the logic and functionality to handle specific types of requests. They are responsible for processing the request, interacting with the database if needed, and preparing the response.
   - **Functionality:** Controllers encapsulate the behavior associated with a particular route or endpoint. They receive input from the request, process it, and send back a response to the client.
   - **Use Case:** In an MVC (Model-View-Controller) architecture, controllers handle the business logic. For example, in a user authentication system, there might be a UserController that handles requests related to user registration, login, and profile retrieval.

In summary, routers manage the flow of incoming requests and direct them to the appropriate controllers, while controllers contain the application's logic and process the requests, ensuring a clear separation of concerns and a modular structure in backend development.