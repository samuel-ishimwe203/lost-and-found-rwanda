import express from 'express';
import { getItems, getItemById, searchItems, getPublicStats } from '../controllers/public.controller.js';

const router = express.Router();

// All public routes (no authentication required)
router.get('/items', getItems);
router.get('/items/:type/:id', getItemById);
router.post('/search', searchItems);
router.get('/stats', getPublicStats);

export default router;
