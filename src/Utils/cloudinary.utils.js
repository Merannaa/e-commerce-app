import { v2 as cloudinary } from "cloudinary";
import { ErrorClass } from "./index.js";

export const cloudinaryConfig = () => {
  // Configuration
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
  });

  return cloudinary;
};


export const uploadFile = async ({file,folder="General",publicId})=>{
  if (!file){
    return next(new ErrorClass('please upload an image',400,'please upload an image'))
  }

  let options={folder}
  if(publicId){
    options.public_id=publicId
  }

  const {secure_url , public_id} = await cloudinaryConfig().uploader.upload(file,options);

  return {secure_url, public_id};
}