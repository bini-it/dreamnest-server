import express from 'express';
import {
  deleteUser,
  getAllTransactions,
  getAllUsers,
  getDashBoard,
  getPropertiesByUser,
  getTourSchedulesByUserId,
  getUserById,
  getWishlistByUser,
} from '../controllers/adminController.js';
import authenticateToken from '../middleware/authenticateToken.js';
import { authorizeRole } from '../middleware/authorizeRole.js';

const router = express.Router();

router.get(
  '/dashboard',
  authenticateToken,
  authorizeRole('admin'),
  getDashBoard
);
router.get('/users', authenticateToken, authorizeRole('admin'), getAllUsers);
router.delete(
  '/users/:id/delete',
  authenticateToken,
  authorizeRole('admin'),
  deleteUser
);
router.get(
  '/users/:userId',
  authenticateToken,
  authorizeRole('admin'),
  getUserById
);
router.get(
  '/transactions',
  authenticateToken,
  authorizeRole('admin'),
  getAllTransactions
);
router.get(
  '/users/:userId/tour-schedules',
  authenticateToken,
  authorizeRole('admin'),
  getTourSchedulesByUserId
);
router.get(
  '/users/:userId/properties',
  authenticateToken,
  authorizeRole('admin'),
  getPropertiesByUser
);
router.get(
  '/users/:userId/wishlist',
  authenticateToken,
  authorizeRole('admin'),
  getWishlistByUser
);

export default router;
