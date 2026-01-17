import express from 'express';
import { postOfficialDocument, getPoliceItems, manageClaims, getReturnedDocuments, getPoliceDashboardStats } from '../controllers/police.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { policeOnly } from '../middleware/role.middleware.js';

const router = express.Router();

// All police routes require authentication and police role
router.use(authenticate, policeOnly);

router.post('/documents', postOfficialDocument);
router.get('/items', getPoliceItems);
router.get('/claims', manageClaims);
router.get('/returned-documents', getReturnedDocuments);
router.get('/stats', getPoliceDashboardStats);

export default router;
