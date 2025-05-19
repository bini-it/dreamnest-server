import express from 'express';
import {
  googleSignin,
  login,
  logout,
  refresh,
  registerUser,
} from '../controllers/authController.js';
const router = express.Router();

router.post('/login', login);
router.post('/register', registerUser);
router.get('/refresh-token', refresh);
router.post('/logout', logout);
router.post('/google', googleSignin);


export default router;
