# Custom api response and error handling

- whenever the `async()` method is completed it return promises you must have to handle it.
the code is written below.

## Code in index.js
```js
connectDB()
.then(()=>{
    app.on("error",(err)=>{
        console.log("Error : occured in promises ",err);
    })
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`server is running at ${process.env.PORT}`);
    }
    )
})
.catch((err)=>{
    console.log("MONGO_DB connection failed !!!",err);
})
```
- app.use() -> generally for middleware. It's a method in Express.js to mount middleware functions. Middleware functions are functions that have access to the request, response, and the next middleware function in the application’s request-response cycle

## Code in app.js
```js
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
const app  = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials : true
})); // Allow cross origin requests
app.use(express.json({limit:"18kb"})); 
app.use(express.static("public")) // for assets
app.use(express.urlencoded({extended:true,limit:"18kb"}));
app.use(cookieParser())
export {app}
```
Q) Need ?

A)The code in app.js sets up the initial configurations and middleware for the Express.js application. It includes configurations for handling cross-origin requests, parsing JSON and URL-encoded data, serving static assets, and parsing cookies. This centralized configuration helps in organizing and initializing the application's middleware in one place.

Q)What is Parsing ?

A) It refers to the process of converting raw data (usually from requests) into a usable format that can be easily manipulated or processed by the backend application.

Q)What is cookie ? 

A) A cookie is a small piece of data stored on the user's device by the web browser. It's often used to store user preferences or session information.

Q)What is cookieParser?

A)cookieParser is middleware in Express.js that parses cookies attached to the incoming requests and makes them accessible in the req.cookies object. It's needed to handle and process cookies sent by clients, often used for session management and user authentication.

1. **CORS (Cross-Origin Resource Sharing):**
   ```javascript
   app.use(cors({
       origin: process.env.CORS_ORIGIN,
       credentials: true
   }));
   ```
   - **Purpose:** CORS is a security feature implemented by web browsers to restrict web pages from making requests to a different domain than the one that served the web page. This configuration allows cross-origin requests by specifying the allowed origin(s) in the `process.env.CORS_ORIGIN` variable.
   - **Need:** This is essential for web applications that make requests to APIs or services hosted on a different domain.
   - In the `.env` file the value of `CORS_ORIGIN` is as `CORS_ORIGIN=*` the `*` it states the url-request is coming form anywhere (the best practise is to specify where the url is coming from)

2. **Express JSON Parser:**
   ```javascript
   app.use(express.json({limit: "18kb"}));
   ```
   - **Purpose:** This configuration enables Express to parse incoming JSON requests. It also sets a limit on the size of the JSON payload to prevent potential abuse or denial-of-service attacks.
   - **Need:** Useful for handling data sent in the body of HTTP requests, common in modern web applications.

3. **Express Static Middleware:**
   ```javascript
   app.use(express.static("public"));
   ```
   - **Purpose:** This middleware serves static files, such as images, stylesheets, and scripts, from the specified directory (`public` in this case).
   - **Need:** Necessary for making assets accessible to clients when hosting a web application.

4. **Express URL-encoded Parser with Extended Option:**
   ```javascript
   app.use(express.urlencoded({extended: true, limit: "18kb"}));
   ```
   - **Purpose:** This configuration allows Express to parse incoming URL-encoded data (e.g., form submissions) and sets a limit on the size of the data.
   - **Need:** Useful for processing form data submitted by users.

5. **Cookie Parser:**
   ```javascript
   app.use(cookieParser());
   ```
   - **Purpose:** This middleware parses cookies attached to the incoming requests and makes them accessible in the `req.cookies` object.
   - **Need:** Enables handling and processing of cookies sent by clients, often used for session management and user authentication. Enable CRUD operations on cookies for developers

### What is middleware?
Middleware are like extra steps or checks in a process. They allow developers to perform additional actions before or after the main logic of a web application, providing a way to customize and enhance the behavior of the application
![Alt text](/notes/images/middleware.png)

## utility functions for custom api, response and error handling

### ApiError.js in utils folder
```js
class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode; // override status code
    this.data = null; // why?
    this.errors = errors;
    this.success = false;
    this.message = message;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
export { ApiError };
```
**Q1) What is the need of the following code?**

A1: The code defines a class named `ApiError`, which extends the built-in `Error` class. The purpose of this class is to standardize the structure of API errors in a web application. It allows developers to create consistent error responses with specified properties like `statusCode`, `message`, `errors`, `success`, and `data`.

**Q2) Explain in detail - why is `this.data = null`?**

A2: The line `this.data = null` initializes the `data` property of the `ApiError` class. In this particular code, it is set to `null` as there might be scenarios where additional data related to the error can be attached. By default, it is set to `null`, but it provides a placeholder for any specific data that developers might want to include when creating an instance of the `ApiError`.

**Q3) What is "stack" in the code?**

A3: In the context of this code, `stack` refers to the stack trace of the error. A stack trace is a detailed report of the function calls made during the execution of the program, which helps developers trace the flow of execution and identify the origin of an error.

**Q4) Explain the if-else part for `stack` in the code; what is `captureStackTrace`? Why did we write the if-else for `stack`? Explain in very detailed and simple way.**

A4: 
- The `if-else` part for `stack` checks if a `stack` parameter is provided when creating an instance of the `ApiError`. If provided, it sets the `stack` property of the error instance to that value; otherwise, it uses the `Error.captureStackTrace(this, this.constructor)` method to automatically capture the stack trace.

- `Error.captureStackTrace` is a method that populates the `stack` property of the error with information about where the error occurred in the code. It is a built-in Node.js method that improves the clarity of stack traces.

- The reason for the `if-else` part is to handle situations where a specific `stack` value is provided during error creation. This allows developers to manually set the stack trace if needed, providing flexibility in how errors are handled and logged.

In summary, the `if-else` part ensures that the `stack` property of the error is appropriately populated, either by a provided value or automatically captured using `Error.captureStackTrace`. This helps in better debugging and understanding the source of errors in the application.
"populated"  means filling or assigning a value to a property. This information helps developers trace and understand the flow of the program when an error occurs.

### asyncHandler.js in utility
```js
const asyncHandler = (requestHandler) => {
  // mistake caught in 12 video
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next))
    .catch((err) => next(err));
  };
};
export { asyncHandler };
```
**Q1) What is the purpose of the following code?**

A1: The purpose of the code is to create an `asyncHandler` function, which is designed to handle asynchronous route handlers in an Express.js application. It simplifies error handling for asynchronous operations, making it more concise and readable.

**Q2) Explain the code in very detailed and easy way:**

A2: 

- **Function Definition:**
  ```javascript
  const asyncHandler = (requestHandler) => {
  ```
  This code defines a function named `asyncHandler` that takes a `requestHandler` as a parameter. The `requestHandler` is assumed to be an asynchronous function that handles a specific route in an Express.js application.

- **Function Body:**
  ```javascript
    (req, res, next) => {
  ```
  The main function body starts with parameters `(req, res, next)`, which are the standard Express.js middleware parameters for handling HTTP requests and responses.

- **Async Operation Handling:**
 Certainly, let's break down the code snippet in more detail:

```javascript
Promise.resolve(requestHandler(req, res, next))
    .catch((err) => next(err));
```

1. **`requestHandler(req, res, next)`**:
   - `requestHandler` is a function that is assumed to be an asynchronous operation handling a specific route in an Express.js application.
   - It takes the standard Express.js middleware parameters: `req` (request), `res` (response), and `next` (next middleware function).

2. **`Promise.resolve(...)`**:
   - `Promise.resolve` is a method that returns a resolved Promise with the provided value.
   - Here, it wraps the invocation of `requestHandler(req, res, next)` in a Promise. This is done to ensure consistent handling of asynchronous operations, converting synchronous and asynchronous code paths into a Promise.

3. **`.catch((err) => next(err))`**:
   - The `.catch` block is attached to the Promise. It handles any errors that might occur during the execution of the asynchronous operation.
   - If an error occurs, the `err` parameter represents that error. The `.catch` block then invokes the `next` function with the `err` parameter, passing the error to the next middleware or the Express.js error-handling middleware.

**Explanation:**
- The `Promise.resolve` part allows us to handle both synchronous and asynchronous code uniformly by wrapping it in a Promise.
- If the `requestHandler` resolves without errors (synchronously or asynchronously), the Promise is resolved, and the control flows to the next middleware.
- If an error occurs during the execution of the `requestHandler`, the `.catch` block catches the error, and the `next` function is called with the error, allowing the Express.js error-handling middleware to take over.

In summary, this code ensures that asynchronous operations are consistently handled using Promises, and any errors during the execution of the `requestHandler` are caught and passed to the Express.js error-handling mechanism for proper handling.


**Summary:**
The `asyncHandler` function simplifies the handling of asynchronous route handlers in Express.js by wrapping them in a Promise and using `Promise.resolve`. This ensures that any asynchronous errors are caught and passed to the Express.js error-handling middleware. It provides a cleaner way to handle asynchronous code within route handlers.

**Way 2**

```js
const asyncHandler = (fn)=> async (req,res,next)=>{
    try {
        await fn(req,res,next)
    } catch (error) {
        res.status(err.code || 500).json({
            success : false,
            message : err.message
        })

    }
}

```

### API response.js in utility
```js
class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}
export { ApiResponse };
```