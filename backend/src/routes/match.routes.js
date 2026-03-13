import express from 'express'
import {
  getMyMatches,
  getMatchById,
  confirmMatch,
  rejectMatch,
  completeMatch
} from '../controllers/match.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const router = express.Router()

router.get('/', authenticate, getMyMatches)
router.get('/:id', authenticate, getMatchById)
router.put('/:id/confirm', authenticate, confirmMatch)
router.put('/:id/reject', authenticate, rejectMatch)
router.put('/:id/complete', authenticate, completeMatch)

export default router