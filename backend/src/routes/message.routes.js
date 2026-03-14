import express from 'express'
import {
  getUserMessages,
  sendMessage,
  replyToMessage,
  markMessageAsRead,
  getUnreadMessageCount,
  deleteMessage
} from '../controllers/message.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const router = express.Router()

router.use(authenticate)
router.get('/', getUserMessages)
router.post('/send', sendMessage)
router.post('/reply', replyToMessage)
router.patch('/:id/read', markMessageAsRead)
router.get('/unread-count', getUnreadMessageCount)
router.delete('/:id', deleteMessage)

export default router