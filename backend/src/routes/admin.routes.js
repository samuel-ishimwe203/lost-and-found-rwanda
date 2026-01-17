import express from 'express';
import { getUsers, createOfficialAccount, updateUser, deleteUser, getSystemStats, getLogs, getAllItems, getAllMatches } from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { adminOnly } from '../middleware/role.middleware.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate, adminOnly);

router.get('/users', getUsers);
router.post('/users', createOfficialAccount);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/stats', getSystemStats);
router.get('/logs', getLogs);
router.get('/items', getAllItems);
router.get('/matches', getAllMatches);

export default router;
