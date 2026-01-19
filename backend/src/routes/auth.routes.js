import express from 'express';
import { login, logout, register, registerPolice, getCurrentUser, updateProfile, changePassword } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/register-police', registerPolice);
router.post('/login', login);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getCurrentUser);
router.put('/profile', authenticate, upload.single('profile_photo'), updateProfile);
router.put('/change-password', authenticate, changePassword);

export default router;
