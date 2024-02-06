# Uplod file in backends with multer

file upload 90% work is of backend developers

once you learn file uploading and file handling in backend you can upload anything like videos or images or pdf anything.

we use 3rd party services or aws for file uploading purpose

we use it as utility so we can reuse same for video , image , pdf ,etc

middleware meme - jaane se pehle hmko mil jana

Cloudinary - To store files in cloud server, it is a service
`npm install cloudinary`

* In order to store the files we choose one of the package betweeon `Multer` and `express-fileupload` but now a days the `Multer` is famous and mostly used in production.

Multer is a node.js middleware for handling multipart/form-data, which is primarily used for uploading files.
`npm i multer`

Understanding Strategy - 
1. we  will use multer to take file from user and upload it temporarily to our local server
2. then we will use cloudinary to upload file from local server to its cloud server

Why use 2 steps? why not directly upload to cloudinary ?
Because if any error occurs while uploading the file on cloudinary side , it helps in reattempt the files enabling us to reupload

what is fs ? file system , built in node js functionality that enables us to perform various read, write,sync,unlink,etc
file is linked and unlinked , when file is deleted it's path is unlinked 

set env write cloudinary.js in utils

write basic multer functionality in middleware folder `multer.middleware.js`

in multer, we use destination as diskStorage rather than Memory bcoz if memory is full, then it will create problem

Multer Documentation - 
<a href="https://github.com/expressjs/multer/tree/master" target="_blank">Here</a>

Clodinary Documnetation - 
<a href="https://console.cloudinary.com/pm/c-75ec36029a953711aedf6c095b2243/getting-started" target="_blank">Here</a>

Research more on this - 

1. Multer configuration, seeing edge cases
```js
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/tmp/my-uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})

const upload = multer({ storage: storage })
```
2. fs.unlinkSync? Why we considered it ? 
```js
// server to cloudinary
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret:process.env.CLOUDINARY_API_SECRET
});

// uploading the files on cloudinary in two steps
// first by uploading on locak storage

const uploadOnCloudinary=async function(localFilePath){
    try {
        if(!localFilePath) return null;
        // upload file on cloudinary
        const response= await cloudinary.uploader
        .upload(localFilePath,{
            // tum(server) khud hi detect krlo file type(.jpg etc)
            resource_type:"auto"
        })
        // the file has been uploaded successfully
        console.log("file has been uploaded on cloudinary",response.url)
        console.log(response)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath);
        // remove the locally saved temp file as the upload operation got failed
        return null;
    }
}

export {uploadOnCloudinary};

// cloudinary.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//   { public_id: "olympic_flag" }, 
//   function(error, result) {console.log(result); });
```