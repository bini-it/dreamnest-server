import express from 'express';
import {
  addToWishlist,
  removeFromWishlist,
  userWishlist,
  getUserProfile,
  updateUserProfile,
  uploadProfilePicture,
  getUserNotifications,
  markNotificationAsRead,
} from '../controllers/userController.js';
import authenticateToken from '../middleware/authenticateToken.js';
import proPicUploader from '../middleware/uploadProfilePicture.js'
const router = express.Router();

router.get('/wishlist', authenticateToken, userWishlist);
router.get('/notifications', authenticateToken, getUserNotifications);
router.patch(
  '/notifications/:notificationId/read',
  authenticateToken,
  markNotificationAsRead
);

router.post('/add-to-wishlist', authenticateToken, addToWishlist);

router.post('/remove-from-wishlist', authenticateToken, removeFromWishlist);
router.get('/profile', authenticateToken, getUserProfile);
router.post(
  '/profile/upload-picture',
  authenticateToken,
  proPicUploader.single('profilePicture'),
  uploadProfilePicture
);
router.put('/profile', authenticateToken, updateUserProfile);

export default router; 
