import express from 'express';
import { postFoundItem, getFoundItems, getFoundItemById, getMyFoundItems, updateFoundItem, deleteFoundItem, getFoundDashboardStats } from '../controllers/found.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { checkRole } from '../middleware/role.middleware.js';
import upload from '../middleware/upload.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getFoundItems);
router.get('/:id', getFoundItemById);

// Protected routes (finders and police)
router.post('/', authenticate, checkRole('finder', 'police'), upload.single('image'), postFoundItem);
router.get('/my/items', authenticate, getMyFoundItems);
router.get('/my/stats', authenticate, checkRole('finder', 'police'), getFoundDashboardStats);
router.put('/:id', authenticate, updateFoundItem);
router.delete('/:id', authenticate, deleteFoundItem);

export default router;
