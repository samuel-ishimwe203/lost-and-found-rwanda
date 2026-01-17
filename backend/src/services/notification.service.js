import { query } from '../db/index.js';
import twilio from 'twilio';
import nodemailer from 'nodemailer';

// Initialize Twilio client (for SMS and WhatsApp)
let twilioClient;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

// Initialize NodeMailer transporter (for Email)
let emailTransporter;
if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  emailTransporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
}

// Create notification and send through preferred channels
export const createNotification = async ({
  userId,
  type,
  title,
  message,
  relatedMatchId = null,
  relatedLostItemId = null,
  relatedFoundItemId = null
}) => {
  try {
    // Get user preferences
    const userResult = await query(
      'SELECT email, phone_number, notification_preferences, language_preference FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      console.error('User not found for notification');
      return;
    }

    const user = userResult.rows[0];
    const preferences = user.notification_preferences || {
      sms: true,
      whatsapp: true,
      email: true,
      in_app: true
    };

    // Always create in-app notification
    const notificationResult = await query(
      `INSERT INTO notifications 
       (user_id, type, title, message, channel, status, related_match_id, related_lost_item_id, related_found_item_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [userId, type, title, message, 'in_app', 'sent', relatedMatchId, relatedLostItemId, relatedFoundItemId]
    );

    const notification = notificationResult.rows[0];

    // Send SMS if enabled and phone number available
    if (preferences.sms && user.phone_number) {
      await sendSMS(userId, user.phone_number, message, notification.id);
    }

    // Send WhatsApp if enabled and phone number available
    if (preferences.whatsapp && user.phone_number) {
      await sendWhatsApp(userId, user.phone_number, message, notification.id);
    }

    // Send Email if enabled and email available
    if (preferences.email && user.email) {
      await sendEmail(userId, user.email, title, message, notification.id);
    }

    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
  }
};

// Send SMS via Twilio
const sendSMS = async (userId, phoneNumber, message, notificationId) => {
  try {
    if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
      console.log('SMS service not configured');
      return;
    }

    // Create SMS notification record
    const notificationResult = await query(
      `INSERT INTO notifications 
       (user_id, type, title, message, channel, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, 'ALERT', 'SMS Notification', message, 'sms', 'pending']
    );

    const smsNotification = notificationResult.rows[0];

    // Send SMS
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    // Update notification status
    await query(
      'UPDATE notifications SET status = $1, sent_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['sent', smsNotification.id]
    );

    console.log(`✅ SMS sent to ${phoneNumber}`);
  } catch (error) {
    console.error('SMS send error:', error);
    // Mark notification as failed
    await query(
      'UPDATE notifications SET status = $1, error_message = $2 WHERE user_id = $3 AND channel = $4',
      ['failed', error.message, userId, 'sms']
    );
  }
};

// Send WhatsApp via Twilio
const sendWhatsApp = async (userId, phoneNumber, message, notificationId) => {
  try {
    if (!twilioClient || !process.env.TWILIO_WHATSAPP_NUMBER) {
      console.log('WhatsApp service not configured');
      return;
    }

    // Create WhatsApp notification record
    const notificationResult = await query(
      `INSERT INTO notifications 
       (user_id, type, title, message, channel, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, 'ALERT', 'WhatsApp Notification', message, 'whatsapp', 'pending']
    );

    const whatsappNotification = notificationResult.rows[0];

    // Send WhatsApp message
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${phoneNumber}`
    });

    // Update notification status
    await query(
      'UPDATE notifications SET status = $1, sent_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['sent', whatsappNotification.id]
    );

    console.log(`✅ WhatsApp sent to ${phoneNumber}`);
  } catch (error) {
    console.error('WhatsApp send error:', error);
    // Mark notification as failed
    await query(
      'UPDATE notifications SET status = $1, error_message = $2 WHERE user_id = $3 AND channel = $4',
      ['failed', error.message, userId, 'whatsapp']
    );
  }
};

// Send Email via NodeMailer
const sendEmail = async (userId, email, subject, message, notificationId) => {
  try {
    if (!emailTransporter) {
      console.log('Email service not configured');
      return;
    }

    // Create email notification record
    const notificationResult = await query(
      `INSERT INTO notifications 
       (user_id, type, title, message, channel, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, 'ALERT', subject, message, 'email', 'pending']
    );

    const emailNotification = notificationResult.rows[0];

    // Send email
    const info = await emailTransporter.sendMail({
      from: `"Lost & Found Rwanda" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">${subject}</h2>
          <p>${message}</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            This is an automated message from Lost & Found Rwanda.<br>
            If you have questions, please contact support.
          </p>
        </div>
      `
    });

    // Update notification status
    await query(
      'UPDATE notifications SET status = $1, sent_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['sent', emailNotification.id]
    );

    console.log(`✅ Email sent to ${email}`);
  } catch (error) {
    console.error('Email send error:', error);
    // Mark notification as failed
    await query(
      'UPDATE notifications SET status = $1, error_message = $2 WHERE user_id = $3 AND channel = $4',
      ['failed', error.message, userId, 'email']
    );
  }
};

// Get user notifications
export const getUserNotifications = async (userId, filters = {}) => {
  try {
    const { status, channel, limit = 50, offset = 0 } = filters;

    let whereConditions = ['user_id = $1'];
    let params = [userId];
    let paramCount = 2;

    if (status) {
      whereConditions.push(`status = $${paramCount++}`);
      params.push(status);
    }

    if (channel) {
      whereConditions.push(`channel = $${paramCount++}`);
      params.push(channel);
    }

    const whereClause = whereConditions.join(' AND ');

    params.push(limit, offset);

    const result = await query(
      `SELECT * FROM notifications
       WHERE ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramCount++} OFFSET $${paramCount}`,
      params
    );

    return result.rows;
  } catch (error) {
    console.error('Get user notifications error:', error);
    throw error;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId, userId) => {
  try {
    const result = await query(
      `UPDATE notifications 
       SET status = 'read', read_at = CURRENT_TIMESTAMP 
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [notificationId, userId]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Mark notification as read error:', error);
    throw error;
  }
};

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (userId) => {
  try {
    await query(
      `UPDATE notifications 
       SET status = 'read', read_at = CURRENT_TIMESTAMP 
       WHERE user_id = $1 AND status != 'read'`,
      [userId]
    );

    return { success: true, message: 'All notifications marked as read' };
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    throw error;
  }
};

// Get unread notification count
export const getUnreadNotificationCount = async (userId) => {
  try {
    const result = await query(
      `SELECT COUNT(*) FROM notifications 
       WHERE user_id = $1 AND channel = 'in_app' AND status != 'read'`,
      [userId]
    );

    return parseInt(result.rows[0].count);
  } catch (error) {
    console.error('Get unread notification count error:', error);
    throw error;
  }
};

// Delete notification
export const deleteNotification = async (notificationId, userId) => {
  try {
    await query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2',
      [notificationId, userId]
    );

    return { success: true, message: 'Notification deleted' };
  } catch (error) {
    console.error('Delete notification error:', error);
    throw error;
  }
};
