import express from 'express';
import { getDashboardStats } from '../controllers/admin.controller.js';
import { authenticateToken, isAdmin } from '../configs/middleware.js';

const router = express.Router();

// Semua rute diproteksi oleh authenticateToken DAN isAdmin
router.get('/stats', authenticateToken, isAdmin, getDashboardStats);

export default router;