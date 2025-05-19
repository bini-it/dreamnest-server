import jwt from 'jsonwebtoken';
import { User } from '../models/userModel.js';

const authenticateOptional = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1]; 
    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password'); 

    req.user = user || null; 
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    req.user = null;
  }
  next();
};

export default authenticateOptional;
