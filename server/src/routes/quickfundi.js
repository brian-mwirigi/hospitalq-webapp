import express from 'express';
import { protect, authorize } from '../middleware.js';
import { searchWorkers, getWorker, createBooking, getBooking } from '../quickfundiCtrl.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/workers', searchWorkers);
router.get('/workers/:id', getWorker);
router.post('/bookings', createBooking);
router.get('/bookings/:id', getBooking);

export default router;
