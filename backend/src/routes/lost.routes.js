import express from 'express';
import { postLostItem, getLostItems, getLostItemById, getMyLostItems, updateLostItem, deleteLostItem, getLostDashboardStats } from '../controllers/lost.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { loserOnly } from '../middleware/role.middleware.js';
import upload from '../middleware/upload.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getLostItems);
router.get('/:id', getLostItemById);

// Protected routes (losers only)
router.post('/', authenticate, loserOnly, upload.single('image'), postLostItem);
router.get('/my/items', authenticate, loserOnly, getMyLostItems);
router.get('/my/stats', authenticate, loserOnly, getLostDashboardStats);
router.put('/:id', authenticate, updateLostItem);
router.delete('/:id', authenticate, deleteLostItem);

export default router;
