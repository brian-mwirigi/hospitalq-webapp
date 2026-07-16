import express from 'express';
import {
  getBusyOverview,
  suggestRedirect,
  getSmsLogs,
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/redirect/:deptId', suggestRedirect);

router.get(
  '/overview',
  protect,
  authorize('admin', 'receptionist', 'doctor'),
  getBusyOverview
);

router.get('/sms', protect, authorize('admin', 'receptionist'), getSmsLogs);

export default router;
