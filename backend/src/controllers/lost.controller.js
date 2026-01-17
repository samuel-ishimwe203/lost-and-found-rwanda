import { query } from '../db/index.js';
import { logAudit } from '../services/audit.service.js';
import { checkForMatches } from '../services/matching.service.js';

// Post a new lost item
export const postLostItem = async (req, res) => {
  try {
    const { 
      item_type, category, description, location_lost, district, 
      date_lost, reward_amount, additional_info 
    } = req.body;
    const userId = req.user.id;

    console.log('Post lost item - Body:', req.body);
    console.log('Post lost item - File:', req.file);

    // Validate required fields
    if (!item_type || !category || !location_lost || !district) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide all required fields: item_type, category, location_lost, district' 
      });
    }

    // Only losers can post lost items
    if (req.user.role !== 'loser') {
      return res.status(403).json({ 
        success: false,
        message: 'Only users with loser role can post lost items' 
      });
    }

    // Handle image upload
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    // Parse additional_info if it's a string
    let parsedAdditionalInfo = additional_info;
    if (typeof additional_info === 'string') {
      try {
        parsedAdditionalInfo = JSON.parse(additional_info);
      } catch (e) {
        parsedAdditionalInfo = {};
      }
    }

    // Create lost item
    const result = await query(
      `INSERT INTO lost_items 
       (user_id, item_type, category, description, location_lost, district, date_lost, reward_amount, image_url, additional_info) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [userId, item_type, category, description, location_lost, district, date_lost, reward_amount || 0, image_url, parsedAdditionalInfo ? JSON.stringify(parsedAdditionalInfo) : null]
    );

    const lostItem = result.rows[0];

    // Log audit
    await logAudit({
      userId,
      action: 'LOST_ITEM_CREATED',
      entityType: 'lost_item',
      entityId: lostItem.id,
      details: { item_type, category, district, reward_amount },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    // Check for potential matches
    await checkForMatches(lostItem.id, 'lost');

    res.status(201).json({
      success: true,
      message: 'Lost item posted successfully',
      data: { lostItem }
    });
  } catch (error) {
    console.error('Post lost item error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error posting lost item',
      error: error.message 
    });
  }
};

// Get all lost items (with optional filters)
export const getLostItems = async (req, res) => {
  try {
    const { status, district, category, search, user_id, limit = 50, offset = 0 } = req.query;

    let whereConditions = [];
    let params = [];
    let paramCount = 1;

    if (status) {
      whereConditions.push(`l.status = $${paramCount++}`);
      params.push(status);
    }

    if (district) {
      whereConditions.push(`l.district = $${paramCount++}`);
      params.push(district);
    }

    if (category) {
      whereConditions.push(`l.category = $${paramCount++}`);
      params.push(category);
    }

    if (user_id) {
      whereConditions.push(`l.user_id = $${paramCount++}`);
      params.push(user_id);
    }

    if (search) {
      whereConditions.push(`(l.item_type ILIKE $${paramCount} OR l.description ILIKE $${paramCount})`);
      params.push(`%${search}%`);
      paramCount++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    params.push(limit, offset);

    const result = await query(
      `SELECT l.*, u.full_name, u.phone_number, u.email
       FROM lost_items l
       JOIN users u ON l.user_id = u.id
       ${whereClause}
       ORDER BY l.created_at DESC
       LIMIT $${paramCount++} OFFSET $${paramCount}`,
      params
    );

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM lost_items l ${whereClause}`,
      params.slice(0, -2)
    );

    res.status(200).json({
      success: true,
      data: {
        lostItems: result.rows,
        total: parseInt(countResult.rows[0].count),
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Get lost items error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error retrieving lost items',
      error: error.message 
    });
  }
};

// Get single lost item by ID
export const getLostItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT l.*, u.full_name, u.phone_number, u.email, u.id as owner_id
       FROM lost_items l
       JOIN users u ON l.user_id = u.id
       WHERE l.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Lost item not found' 
      });
    }

    // Get matches for this item
    const matchesResult = await query(
      `SELECT m.*, f.item_type as found_item_type, f.location_found, f.date_found,
              u.full_name as finder_name, u.phone_number as finder_phone
       FROM matches m
       JOIN found_items f ON m.found_item_id = f.id
       JOIN users u ON f.user_id = u.id
       WHERE m.lost_item_id = $1
       ORDER BY m.matched_at DESC`,
      [id]
    );

    res.status(200).json({
      success: true,
      data: {
        lostItem: result.rows[0],
        matches: matchesResult.rows
      }
    });
  } catch (error) {
    console.error('Get lost item error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error retrieving lost item',
      error: error.message 
    });
  }
};

// Get user's own lost items
export const getMyLostItems = async (req, res) => {
  try {
    console.log('getMyLostItems called - User:', req.user);
    const userId = req.user.id;
    const { status } = req.query;

    let whereClause = 'WHERE l.user_id = $1';
    const params = [userId];

    if (status) {
      whereClause += ' AND l.status = $2';
      params.push(status);
    }

    const result = await query(
      `SELECT l.*,
              (SELECT COUNT(*) FROM matches WHERE lost_item_id = l.id) as match_count
       FROM lost_items l
       ${whereClause}
       ORDER BY l.created_at DESC`,
      params
    );

    console.log('Found items:', result.rows.length);

    res.status(200).json({
      success: true,
      data: { lostItems: result.rows }
    });
  } catch (error) {
    console.error('Get my lost items error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error retrieving your lost items',
      error: error.message 
    });
  }
};

// Update lost item
export const updateLostItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { 
      item_type, category, description, location_lost, district, 
      date_lost, reward_amount, status, image_url, additional_info 
    } = req.body;

    // Check if item exists and belongs to user
    const checkResult = await query(
      'SELECT * FROM lost_items WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Lost item not found' 
      });
    }

    const item = checkResult.rows[0];

    // Only owner or admin can update
    if (item.user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'You do not have permission to update this item' 
      });
    }

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (item_type !== undefined) {
      updates.push(`item_type = $${paramCount++}`);
      values.push(item_type);
    }
    if (category !== undefined) {
      updates.push(`category = $${paramCount++}`);
      values.push(category);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (location_lost !== undefined) {
      updates.push(`location_lost = $${paramCount++}`);
      values.push(location_lost);
    }
    if (district !== undefined) {
      updates.push(`district = $${paramCount++}`);
      values.push(district);
    }
    if (date_lost !== undefined) {
      updates.push(`date_lost = $${paramCount++}`);
      values.push(date_lost);
    }
    if (reward_amount !== undefined) {
      updates.push(`reward_amount = $${paramCount++}`);
      values.push(reward_amount);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }
    if (image_url !== undefined) {
      updates.push(`image_url = $${paramCount++}`);
      values.push(image_url);
    }
    if (additional_info !== undefined) {
      updates.push(`additional_info = $${paramCount++}`);
      values.push(JSON.stringify(additional_info));
    }

    if (updates.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'No fields to update' 
      });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE lost_items SET ${updates.join(', ')} 
       WHERE id = $${paramCount} 
       RETURNING *`,
      values
    );

    // Log audit
    await logAudit({
      userId,
      action: 'LOST_ITEM_UPDATED',
      entityType: 'lost_item',
      entityId: id,
      details: req.body,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(200).json({
      success: true,
      message: 'Lost item updated successfully',
      data: { lostItem: result.rows[0] }
    });
  } catch (error) {
    console.error('Update lost item error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error updating lost item',
      error: error.message 
    });
  }
};

// Delete lost item
export const deleteLostItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if item exists and belongs to user
    const checkResult = await query(
      'SELECT * FROM lost_items WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Lost item not found' 
      });
    }

    const item = checkResult.rows[0];

    // Only owner or admin can delete
    if (item.user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'You do not have permission to delete this item' 
      });
    }

    await query('DELETE FROM lost_items WHERE id = $1', [id]);

    // Log audit
    await logAudit({
      userId,
      action: 'LOST_ITEM_DELETED',
      entityType: 'lost_item',
      entityId: id,
      details: { item_type: item.item_type, category: item.category },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(200).json({
      success: true,
      message: 'Lost item deleted successfully'
    });
  } catch (error) {
    console.error('Delete lost item error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error deleting lost item',
      error: error.message 
    });
  }
};

// Get dashboard statistics for loser
export const getLostDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Total lost items posted
    const totalResult = await query(
      'SELECT COUNT(*) FROM lost_items WHERE user_id = $1',
      [userId]
    );

    // Active postings
    const activeResult = await query(
      'SELECT COUNT(*) FROM lost_items WHERE user_id = $1 AND status = $2',
      [userId, 'active']
    );

    // Matched items
    const matchedResult = await query(
      'SELECT COUNT(*) FROM lost_items WHERE user_id = $1 AND status = $2',
      [userId, 'matched']
    );

    // Pending matches
    const pendingMatchesResult = await query(
      `SELECT COUNT(*) FROM matches m
       JOIN lost_items l ON m.lost_item_id = l.id
       WHERE l.user_id = $1 AND m.status = 'pending'`,
      [userId]
    );

    // Resolved items
    const resolvedResult = await query(
      'SELECT COUNT(*) FROM lost_items WHERE user_id = $1 AND status = $2',
      [userId, 'resolved']
    );

    // Total reward offered
    const rewardResult = await query(
      'SELECT SUM(reward_amount) as total_reward FROM lost_items WHERE user_id = $1 AND status != $2',
      [userId, 'closed']
    );

    res.status(200).json({
      success: true,
      data: {
        totalLostItems: parseInt(totalResult.rows[0].count),
        activePostings: parseInt(activeResult.rows[0].count),
        matchedItems: parseInt(matchedResult.rows[0].count),
        pendingMatches: parseInt(pendingMatchesResult.rows[0].count),
        resolvedItems: parseInt(resolvedResult.rows[0].count),
        totalRewardOffered: parseFloat(rewardResult.rows[0].total_reward || 0)
      }
    });
  } catch (error) {
    console.error('Get lost dashboard stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error retrieving dashboard statistics',
      error: error.message 
    });
  }
};
