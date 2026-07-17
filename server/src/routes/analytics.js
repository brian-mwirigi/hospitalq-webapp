import express from 'express';
import {
  getBusyOverview,
  suggestRedirect,
  getSmsLogs,
} from '../analyticsCtrl.js';
import { protect, authorize } from '../middleware.js';

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
