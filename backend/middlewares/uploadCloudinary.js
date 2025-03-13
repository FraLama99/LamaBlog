import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const cloudinaryStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'epiblog/authors',
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        allowed_formats: ['jpg', 'jpeg', 'png']
    }
});

const uploadCloudinary = multer({ storage: cloudinaryStorage });

export default uploadCloudinary;
