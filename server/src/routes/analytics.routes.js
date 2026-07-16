import express from 'express';
import {
  getBusyOverview,
  suggestRedirect,
  getSmsLogs,
} from '../controllers/analytics.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = express.Router();

// patient page can read redirect suggestion (no login)
router.get('/redirect/:deptId', suggestRedirect);

router.get(
  '/overview',
  protect,
  authorize('admin', 'receptionist', 'doctor'),
  getBusyOverview
);

router.get('/sms', protect, authorize('admin', 'receptionist'), getSmsLogs);

export default router;
