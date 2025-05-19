import jwt from 'jsonwebtoken';
import { User } from '../models/userModel.js';

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    // console.error('Token verification failed:', error.message);

    if (error.name === 'TokenExpiredError') {
      
      return res
        .status(401)
        .json({ message: 'Token expired' });
    }

    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export default authenticateToken;
