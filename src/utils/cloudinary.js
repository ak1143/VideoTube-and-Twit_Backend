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
        console.log("file has been uploaded on cloudinary",response.url);
        // fs.unlinkSync(localFilePath);
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


