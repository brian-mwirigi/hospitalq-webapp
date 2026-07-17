import express from 'express';
import {
  getQueue,
  addPatient,
  markDone,
  markNoShow,
  markInProgress,
  skipPatient,
  removePatient,
  getStats,
} from '../queueCtrl.js';
import { protect, authorize } from '../middleware.js';

const router = express.Router();

router.get('/:deptId/stats', getStats);
router.get('/:deptId', getQueue);
router.post('/', protect, authorize('receptionist', 'admin'), addPatient);
router.patch('/:id/done', protect, authorize('doctor', 'admin'), markDone);
router.patch('/:id/no-show', protect, authorize('doctor', 'admin'), markNoShow);
router.patch('/:id/in-progress', protect, authorize('doctor', 'admin'), markInProgress);
router.patch('/:id/skip', protect, authorize('receptionist', 'admin'), skipPatient);
router.delete('/:id', protect, authorize('receptionist', 'admin'), removePatient);

export default router;
