import jwt from 'jsonwebtoken'
import { query } from '../db/index.js'

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided. Access denied.' })
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const result = await query('SELECT id, email, role, is_active FROM users WHERE id = $1', [decoded.id])
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid token. User not found.' })
    }
    const user = result.rows[0]
    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated.' })
    }
    req.user = user
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token' })
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired. Please login again.' })
    }
    res.status(500).json({ success: false, message: 'Server error in authentication', error: error.message })
  }
}

export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return next()
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const result = await query('SELECT id, email, role, is_active FROM users WHERE id = $1', [decoded.id])
    if (result.rows.length > 0 && result.rows[0].is_active) {
      req.user = result.rows[0]
    }
    next()
  } catch (error) {
    next()
  }
}