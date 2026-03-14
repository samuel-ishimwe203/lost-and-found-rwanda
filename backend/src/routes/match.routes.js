import express from 'express'
import {
  getMyMatches,
  getMatchById,
  confirmMatch,
  rejectMatch,
  completeMatch,
  deleteMatch,
  payMatchFee
} from '../controllers/match.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const router = express.Router()

router.get('/', authenticate, getMyMatches)
router.get('/:id', authenticate, getMatchById)
router.post('/:id/pay', authenticate, payMatchFee)
router.put('/:id/confirm', authenticate, confirmMatch)
router.put('/:id/reject', authenticate, rejectMatch)
router.put('/:id/complete', authenticate, completeMatch)
router.delete('/:id', authenticate, deleteMatch)

export default router