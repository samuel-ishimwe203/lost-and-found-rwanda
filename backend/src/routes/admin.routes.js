import express from 'express';
import { 
  getUsers, createOfficialAccount, updateUser, deleteUser, 
  getSystemStats, getLogs, getAllItems, getAllMatches, 
  getPendingPoliceRegistrations, approvePoliceRegistration, 
  rejectPoliceRegistration, verifyMatch, confirmMatchPayment 
} from '../controllers/admin.controller.js';
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

// Police registration approval routes
router.get('/police/pending', getPendingPoliceRegistrations);
router.post('/police/approve/:police_profile_id', approvePoliceRegistration);
router.post('/police/reject/:police_profile_id', rejectPoliceRegistration);

// Match verification
router.post('/matches/verify/:matchId', verifyMatch);
router.post('/matches/confirm-payment/:matchId', confirmMatchPayment);


export default router;
