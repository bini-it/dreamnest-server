import express from 'express';
import authenticateToken from '../middleware/authenticateToken.js';
import {
  schedulePropertyTour,
  getUserTourSchedules,
  confirmTourSchedule,
  getUserTourRequests,
  cancelTourSchedule,
} from '../controllers/tourScheduleController.js';

const router = express.Router();
router.post('/schedule-tour', authenticateToken, schedulePropertyTour);
router.get('/schedules', authenticateToken, getUserTourSchedules);
router.get('/requests', authenticateToken, getUserTourRequests);
router.patch(
  '/confirm/:tourId',
  authenticateToken,
  confirmTourSchedule
);
router.patch(
  '/cancel/:tourId',
  authenticateToken,
  cancelTourSchedule
);

export default router;
