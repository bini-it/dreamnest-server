import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'profilePictures',
    allowedFormats: ['jpeg', 'png'],
    transformation: [{ width: 300, height: 300, crop: 'limit' }], 
  },
});
const proPicUploader = multer({ storage });

export default proPicUploader;
