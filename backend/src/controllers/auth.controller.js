import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { query } from '../db/index.js'
import { logAudit } from '../services/audit.service.js'

const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  })
}

export const register = async (req, res) => {
  try {
    const { email, password, full_name, phone_number, role, language_preference } = req.body
    if (!['loser', 'finder'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role. Only loser and finder roles can register.' })
    }
    if (!email || !password || !full_name || !role) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields: email, password, full_name, role' })
    }
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' })
    }
    const validDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'protonmail.com', 'lostandfound.rw']
    const emailDomain = email.split('@')[1]?.toLowerCase()
    if (!validDomains.includes(emailDomain)) {
      return res.status(400).json({ success: false, message: 'Please use a valid email address from a recognized email provider (gmail.com, yahoo.com, outlook.com, etc.)' })
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' })
    }
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email])
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'This email is already registered. Please login or use a different email address.' })
    }
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    const result = await query(
      `INSERT INTO users (email, password, full_name, phone_number, role, language_preference) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, full_name, phone_number, role, language_preference, created_at`,
      [email, hashedPassword, full_name, phone_number, role, language_preference || 'en']
    )
    const user = result.rows[0]
    const token = generateToken(user.id, user.role)
    await logAudit({
      userId: user.id,
      action: 'USER_REGISTERED',
      entityType: 'user',
      entityId: user.id,
      details: { email, role },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    })
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          phone_number: user.phone_number,
          role: user.role,
          language_preference: user.language_preference
        },
        token
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to complete registration. Please try again later or contact support if the problem persists.', error: error.message })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter both email and password to continue.' })
    }
    const result = await query('SELECT * FROM users WHERE email = $1', [email])
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'No account found with this email address. Please check your email or register for a new account.' })
    }
    const user = result.rows[0]
    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact admin.' })
    }
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Incorrect password. Please try again or reset your password.' })
    }
    const token = generateToken(user.id, user.role)
    await logAudit({
      userId: user.id,
      action: 'USER_LOGIN',
      entityType: 'user',
      entityId: user.id,
      details: { email },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    })
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          phone_number: user.phone_number,
          role: user.role,
          language_preference: user.language_preference,
          notification_preferences: user.notification_preferences
        },
        token
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to complete login. Please try again later or contact support if the problem persists.', error: error.message })
  }
}

export const logout = async (req, res) => {
  try {
    if (req.user) {
      await logAudit({
        userId: req.user.id,
        action: 'USER_LOGOUT',
        entityType: 'user',
        entityId: req.user.id,
        details: {},
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      })
    }
    res.status(200).json({ success: true, message: 'Logout successful' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during logout', error: error.message })
  }
}

export const getCurrentUser = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, email, full_name, phone_number, role, language_preference, notification_preferences, is_active, created_at FROM users WHERE id = $1`,
      [req.user.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }
    res.status(200).json({ success: true, data: { user: result.rows[0] } })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving user', error: error.message })
  }
}

export const updateProfile = async (req, res) => {
  try {
    const { full_name, phone_number, language_preference, notification_preferences, bio, district } = req.body
    const userId = req.user.id
    const updates = []
    const values = []
    let paramCount = 1
    const safeTrim = (val) => (typeof val === 'string' ? val.trim() : '')
    const hasValue = (val) => val !== undefined && val !== null && safeTrim(val) !== ''
    if (hasValue(full_name)) {
      updates.push(`full_name = $${paramCount++}`)
      values.push(safeTrim(full_name))
    }
    if (hasValue(phone_number)) {
      updates.push(`phone_number = $${paramCount++}`)
      values.push(safeTrim(phone_number))
    }
    if (hasValue(language_preference)) {
      updates.push(`language_preference = $${paramCount++}`)
      values.push(safeTrim(language_preference))
    }
    if (notification_preferences) {
      updates.push(`notification_preferences = $${paramCount++}`)
      values.push(JSON.stringify(notification_preferences))
    }
    if (bio !== undefined && bio !== null) {
      updates.push(`bio = $${paramCount++}`)
      values.push(safeTrim(bio))
    }
    if (hasValue(district)) {
      updates.push(`district = $${paramCount++}`)
      values.push(safeTrim(district))
    }
    if (req.file) {
      const photoPath = `/uploads/${req.file.filename}`
      updates.push(`profile_image = $${paramCount++}`)
      values.push(photoPath)
    }
    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' })
    }
    updates.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(userId)
    const result = await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, email, full_name, phone_number, role, language_preference, notification_preferences, bio, district, profile_image, created_at`,
      values
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }
    await logAudit({
      userId,
      action: 'PROFILE_UPDATED',
      entityType: 'user',
      entityId: userId,
      details: { ...req.body, photo_uploaded: !!req.file },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    })
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: result.rows[0]
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating profile', error: error.message })
  }
}

export const changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body
    const userId = req.user.id
    if (!current_password || !new_password) {
      return res.status(400).json({ success: false, message: 'Please provide current and new password' })
    }
    const result = await query('SELECT password FROM users WHERE id = $1', [userId])
    const user = result.rows[0]
    const isPasswordValid = await bcrypt.compare(current_password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' })
    }
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(new_password, salt)
    await query('UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [hashedPassword, userId])
    await logAudit({
      userId,
      action: 'PASSWORD_CHANGED',
      entityType: 'user',
      entityId: userId,
      details: {},
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    })
    res.status(200).json({ success: true, message: 'Password changed successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error changing password', error: error.message })
  }
}

export const registerPolice = async (req, res) => {
  try {
    return res.status(403).json({
      success: false,
      message: 'Police self-registration is disabled. Please contact the administrator to have your account created.'
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during police registration', error: error.message })
  }
}