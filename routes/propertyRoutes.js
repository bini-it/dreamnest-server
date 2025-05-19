import express from 'express';
import {
  addProperty,
  getProperties,
  getPropertiesByCategory,
  getPropertiesOwnedByUser,
  getPropertyById,
  updateProperty,
  deleteProperty,
  validateProperty,
  getTopPropertyLocations,
  getFeaturedProperties,
  uploadPropertyImages,
} from '../controllers/propertyController.js';
import authenticateToken from '../middleware/authenticateToken.js';
import authenticateOptional from '../middleware/authenticateOptional.js';
import propertyPhotoUploader from '../middleware/uploadPropertyPhotos.js';
const router = express.Router();

router.get('/list', authenticateOptional, getProperties);

router.get('/featured', getFeaturedProperties);
router.get('/top-locations', getTopPropertyLocations);
router.get('/list/categorized', authenticateOptional, getPropertiesByCategory); // should be defined frst or itll cause objid error
router.get('/list/:id', authenticateOptional, getPropertyById);
router.get('/my-properties', authenticateToken, getPropertiesOwnedByUser);
router.put('/list/:id/update', authenticateToken, updateProperty);
router.post(
  '/list/:id/upload-images',
  authenticateToken,
  propertyPhotoUploader.array('photos'),
  uploadPropertyImages
);
router.post('/validate', authenticateToken, validateProperty);
router.delete('/list/:id/delete', authenticateToken, deleteProperty);
router.post(
  '/add-property',
  authenticateToken,
  propertyPhotoUploader.array('photos'),
  addProperty
);
export default router;
