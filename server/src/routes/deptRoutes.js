import express from 'express';
import {
  getAllDepartments,
  getDepartmentBySlug,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentQR,
} from '../controllers/deptController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', getAllDepartments);
router.get('/:id/qr', protect, authorize('admin', 'receptionist'), getDepartmentQR);
router.get('/:slug', getDepartmentBySlug);
router.post('/', protect, authorize('admin'), createDepartment);
router.patch('/:id', protect, authorize('admin'), updateDepartment);
router.delete('/:id', protect, authorize('admin'), deleteDepartment);

export default router;
