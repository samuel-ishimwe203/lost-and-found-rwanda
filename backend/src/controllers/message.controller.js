import { query } from '../db/index.js';

// Get all messages for a user (both sent and received - full conversation)
export const getUserMessages = async (req, res) => {
  try {
    const userId = req.user.id;

    const queryText = `
      SELECT 
        m.*,
        sender.full_name as sender_name,
        sender.email as sender_email,
        sender.phone_number as sender_phone,
        receiver.full_name as receiver_name,
        receiver.email as receiver_email,
        receiver.phone_number as receiver_phone,
        li.item_type as lost_item_type,
        li.category as lost_item_category,
        li.id as lost_item_id
      FROM messages m
      JOIN users sender ON m.sender_id = sender.id
      JOIN users receiver ON m.receiver_id = receiver.id
      LEFT JOIN matches mat ON m.match_id = mat.id
      LEFT JOIN lost_items li ON mat.lost_item_id = li.id OR m.subject LIKE '%' || li.item_type || '%'
      WHERE m.receiver_id = $1 OR m.sender_id = $1
      ORDER BY m.created_at DESC
    `;

    const result = await query(queryText, [userId]);

    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get user messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving messages',
      error: error.message
    });
  }
};

// Send a message (from finder to loser about their lost item OR loser to finder about found item)
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const senderRole = req.user.role;
    const { receiver_id, lost_item_id, found_item_id, message, subject } = req.body;

    if (!receiver_id || !message) {
      return res.status(400).json({
        success: false,
        message: 'Receiver ID and message are required'
      });
    }

    // Get receiver's role
    const receiverQuery = await query(
      'SELECT role FROM users WHERE id = $1',
      [receiver_id]
    );

    if (receiverQuery.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    const receiverRole = receiverQuery.rows[0].role;

    // Validate: prevent same-role messaging
    // Allowed: loser ↔ finder, loser ↔ police, finder ↔ police
    // Not Allowed: loser → loser, finder → finder, police → police
    if (senderRole === receiverRole) {
      return res.status(403).json({
        success: false,
        message: `You cannot send messages to another ${senderRole}. You can only message ${
          senderRole === 'loser' ? 'finders or police officers' :
          senderRole === 'finder' ? 'losers or police officers' :
          'losers or finders'
        }.`
      });
    }

    // Get item information for subject if not provided
    let finalSubject = subject;
    if (!finalSubject) {
      if (lost_item_id) {
        const itemQuery = await query(
          'SELECT item_type, category FROM lost_items WHERE id = $1',
          [lost_item_id]
        );
        if (itemQuery.rows.length > 0) {
          const item = itemQuery.rows[0];
          finalSubject = `Found item matching your ${item.item_type || item.category}`;
        }
      } else if (found_item_id) {
        const itemQuery = await query(
          'SELECT item_type, category FROM found_items WHERE id = $1',
          [found_item_id]
        );
        if (itemQuery.rows.length > 0) {
          const item = itemQuery.rows[0];
          finalSubject = `Question about your found ${item.item_type || item.category}`;
        }
      }
    }

    const insertQuery = `
      INSERT INTO messages (sender_id, receiver_id, subject, message, created_at, updated_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const result = await query(insertQuery, [
      senderId,
      receiver_id,
      finalSubject || 'Message about item',
      message
    ]);

    // Create notification for receiver
    const notificationQuery = `
      INSERT INTO notifications (user_id, type, title, message, related_lost_item_id, related_found_item_id, channel, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;

    await query(notificationQuery, [
      receiver_id,
      'message',
      'New Message',
      `You have a new message: ${finalSubject}`,
      lost_item_id || null,
      found_item_id || null,
      'in_app'
    ]);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error sending message',
      error: error.message
    });
  }
};

// Reply to a message
export const replyToMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { original_message_id, message, receiver_id, match_id } = req.body;

    if ((!original_message_id && !receiver_id) || !message) {
      return res.status(400).json({
        success: false,
        message: 'Receiver/Original message ID and message are required'
      });
    }

    let receiverId, subject, matchId;

    // If original_message_id provided, get receiver from that
    if (original_message_id) {
      const originalMessageQuery = await query(
        'SELECT sender_id, receiver_id, subject, match_id FROM messages WHERE id = $1',
        [original_message_id]
      );

      if (originalMessageQuery.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Original message not found'
        });
      }

      const originalMessage = originalMessageQuery.rows[0];
      
      // Reply to the OTHER person in conversation (not yourself)
      receiverId = originalMessage.sender_id === senderId 
        ? originalMessage.receiver_id 
        : originalMessage.sender_id;
      
      subject = originalMessage.subject ? `Re: ${originalMessage.subject}` : 'Reply';
      matchId = originalMessage.match_id;
    } else {
      // Direct reply with receiver_id
      receiverId = receiver_id;
      subject = 'Message';
      matchId = match_id;
    }

    // Prevent sending to yourself
    if (receiverId === senderId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send message to yourself'
      });
    }

    const insertQuery = `
      INSERT INTO messages (sender_id, receiver_id, subject, message, match_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const result = await query(insertQuery, [
      senderId,
      receiverId,
      subject,
      message,
      matchId
    ]);

    // Create notification for receiver
    const notificationQuery = `
      INSERT INTO notifications (user_id, type, title, message, related_match_id, channel, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;

    await query(notificationQuery, [
      receiverId,
      'message',
      'New Message',
      `You have a new message: ${subject}`,
      matchId || null,
      'in_app'
    ]);

    res.status(201).json({
      success: true,
      message: 'Reply sent successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Reply to message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error sending reply',
      error: error.message
    });
  }
};

// Mark message as read
export const markMessageAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const queryText = `
      UPDATE messages 
      SET is_read = true 
      WHERE id = $1 AND receiver_id = $2
      RETURNING *
    `;

    const result = await query(queryText, [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or unauthorized'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Message marked as read',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error marking message as read',
      error: error.message
    });
  }
};

// Get unread message count
export const getUnreadMessageCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const queryText = `
      SELECT COUNT(*) as count 
      FROM messages 
      WHERE receiver_id = $1 AND is_read = false
    `;

    const result = await query(queryText, [userId]);

    res.status(200).json({
      success: true,
      data: { unreadCount: parseInt(result.rows[0].count) }
    });
  } catch (error) {
    console.error('Get unread message count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting unread count',
      error: error.message
    });
  }
};

// Delete a message
export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const queryText = `
      DELETE FROM messages 
      WHERE id = $1 AND receiver_id = $2
      RETURNING *
    `;

    const result = await query(queryText, [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or unauthorized'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting message',
      error: error.message
    });
  }
};
