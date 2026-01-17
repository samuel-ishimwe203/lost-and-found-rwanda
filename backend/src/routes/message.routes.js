import express from 'express';
import { 
  getUserMessages, 
  sendMessage, 
  replyToMessage, 
  markMessageAsRead, 
  getUnreadMessageCount,
  deleteMessage
} from '../controllers/message.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get user's messages (inbox)
router.get('/', getUserMessages);

// Send a new message
router.post('/send', sendMessage);

// Reply to a message
router.post('/reply', replyToMessage);

// Mark message as read
router.patch('/:id/read', markMessageAsRead);

// Get unread count
router.get('/unread-count', getUnreadMessageCount);

// Delete message
router.delete('/:id', deleteMessage);

export default router;
