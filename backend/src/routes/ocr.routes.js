import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { checkRole } from '../middleware/role.middleware.js';
import upload from '../middleware/upload.middleware.js';
import { reportLostId, reportFoundId } from '../controllers/ocr.controller.js';

const router = express.Router();

// Lost ID via OCR (loser role)
router.post(
  '/report-lost',
  authenticate,
  checkRole('loser'),
  upload.single('image'),
  reportLostId
);

// Found ID via OCR (finder or police roles)
router.post(
  '/report-found',
  authenticate,
  checkRole('finder', 'police'),
  upload.single('image'),
  reportFoundId
);

export default router;



