import express from 'express';
import {
  getAllDepartments,
  getDepartmentBySlug,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentQR,
} from '../deptsCtrl.js';
import { protect, authorize } from '../middleware.js';

const router = express.Router();

router.get('/', getAllDepartments);
router.get('/:id/qr', protect, authorize('admin', 'receptionist'), getDepartmentQR);
router.get('/:slug', getDepartmentBySlug);
router.post('/', protect, authorize('admin'), createDepartment);
router.patch('/:id', protect, authorize('admin'), updateDepartment);
router.delete('/:id', protect, authorize('admin'), deleteDepartment);

export default router;
