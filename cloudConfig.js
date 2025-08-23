import dotenv from 'dotenv';
import {v2 as cloudinary} from 'cloudinary';
import {CloudinaryStorage} from 'multer-storage-cloudinary';

// Load .env when not in production to ensure process.env variables are available
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

// Configure Cloudinary storage
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'stayEase', // Folder in Cloudinary where images will be stored
        allowed_formats: ['jpg', 'png', 'jpeg'], // Allowed file formats
    }
});

export { cloudinary, storage };
