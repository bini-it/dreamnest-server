import express from 'express';
import {
  createPaymentIntent,
//   updateTransaction,
} from '../controllers/paymentController.js';
import authenticateToken from '../middleware/authenticateToken.js';
const router = express.Router();

router.post('/create-payment-intent', authenticateToken, createPaymentIntent);

// router.patch('/transactions/update', authenticateToken, updateTransaction);

export default router;
