import express from 'express';

import{
    getUsers,
    getUser,
    updateUser,
    deleteUser,
    getUserProfile,
    toggleWatchlist,
    getWatchlist
} from  '../controllers/user.controller.js';
import { authenticateToken, isAdmin } from '../configs/middleware.js';

const router = express.Router();

// rute user
router.get('/profile', authenticateToken, getUserProfile);
router.post('/watchlist/toggle', authenticateToken, toggleWatchlist);
router.get('/watchlist/me', authenticateToken, getWatchlist);

// rute admin
router.get('/', authenticateToken, isAdmin ,getUsers);
router.get('/:id',authenticateToken, isAdmin, getUser);

//rute campuran admin dan user itu sendiri (logika di controller)
router.patch('/update/:id', authenticateToken, updateUser);
router.delete('/delete/:id', authenticateToken, isAdmin, deleteUser);

export default router;