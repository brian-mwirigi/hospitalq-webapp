import express from 'express';
import { login, getMe, logout } from '../authCtrl.js';
import { protect } from '../middleware.js';

const router = express.Router();

router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

export default router;
