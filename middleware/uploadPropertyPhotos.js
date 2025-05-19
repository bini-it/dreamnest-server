import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

// Cloudinary Storage for property photos
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'properties', 
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});
const propertyPhotoUploader = multer({ storage });

export default propertyPhotoUploader;
