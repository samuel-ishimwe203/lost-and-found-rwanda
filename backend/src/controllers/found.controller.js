import { query } from '../db/index.js';
import { logAudit } from '../services/audit.service.js';
import { checkForMatches, checkForDuplicatesInSection } from '../services/matching.service.js';

// Post a new found item
export const postFoundItem = async (req, res) => {
  try {
    console.log('Post found item - Body:', req.body);
    console.log('Post found item - File:', req.file);

    const { 
      item_type, category, description, location_found, district, 
      date_found, additional_info 
    } = req.body;
    const userId = req.user.id;

    // Handle uploaded file
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    // Parse additional_info if it's a JSON string
    let parsedAdditionalInfo = null;
    if (additional_info) {
      try {
        parsedAdditionalInfo = JSON.parse(additional_info);
      } catch (e) {
        parsedAdditionalInfo = {};
      }
    }

    // Validate required fields
    if (!item_type || !category || !location_found || !district) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide all required fields: item_type, category, location_found, district' 
      });
    }

    // Only finders and police can post found items
    if (!['finder', 'police'].includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: 'Only users with finder or police role can post found items' 
      });
    }

    const isPoliceUpload = req.user.role === 'police';

    // Check for duplicates in the found items section
    // Prevent multiple people from posting the same found item
    const duplicateCheck = await checkForDuplicatesInSection(
      { category, image_url, item_type, district },
      'found'
    );

    if (duplicateCheck && duplicateCheck.isDuplicate) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate item detected! ' + duplicateCheck.message,
        error: 'DUPLICATE_ITEM',
        existingItem: {
          id: duplicateCheck.existingItem.id,
          item_type: duplicateCheck.existingItem.item_type,
          category: duplicateCheck.existingItem.category,
          district: duplicateCheck.existingItem.district,
          contact: duplicateCheck.existingItem.full_name
        }
      });
    }

    // Create found item
    const result = await query(
      `INSERT INTO found_items 
       (user_id, item_type, category, description, location_found, district, date_found, is_police_upload, image_url, additional_info) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [userId, item_type, category, description, location_found, district, date_found, isPoliceUpload, image_url, parsedAdditionalInfo ? JSON.stringify(parsedAdditionalInfo) : null]
    );

    const foundItem = result.rows[0];

    // Log audit
    await logAudit({
      userId,
      action: 'FOUND_ITEM_CREATED',
      entityType: 'found_item',
      entityId: foundItem.id,
      details: { item_type, category, district, is_police_upload: isPoliceUpload },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    // Check for potential matches
    await checkForMatches(foundItem.id, 'found');

    res.status(201).json({
      success: true,
      message: 'Found item posted successfully',
      data: { foundItem }
    });
  } catch (error) {
    console.error('Post found item error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error posting found item',
      error: error.message 
    });
  }
};

// Get all found items (with optional filters)
export const getFoundItems = async (req, res) => {
  try {
    const { status, district, category, search, is_police_upload, limit = 50, offset = 0 } = req.query;

    let whereConditions = [];
    let params = [];
    let paramCount = 1;

    if (status) {
      whereConditions.push(`f.status = $${paramCount++}`);
      params.push(status);
    }

    if (district) {
      whereConditions.push(`f.district = $${paramCount++}`);
      params.push(district);
    }

    if (category) {
      whereConditions.push(`f.category = $${paramCount++}`);
      params.push(category);
    }

    if (is_police_upload !== undefined) {
      whereConditions.push(`f.is_police_upload = $${paramCount++}`);
      params.push(is_police_upload === 'true');
    }

    if (search) {
      whereConditions.push(`(f.item_type ILIKE $${paramCount} OR f.description ILIKE $${paramCount})`);
      params.push(`%${search}%`);
      paramCount++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    params.push(limit, offset);

    const result = await query(
      `SELECT f.*, u.full_name, u.phone_number, u.email, u.role as uploader_role
       FROM found_items f
       JOIN users u ON f.user_id = u.id
       ${whereClause}
       ORDER BY f.created_at DESC
       LIMIT $${paramCount++} OFFSET $${paramCount}`,
      params
    );

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM found_items f ${whereClause}`,
      params.slice(0, -2)
    );

    res.status(200).json({
      success: true,
      data: {
        foundItems: result.rows,
        total: parseInt(countResult.rows[0].count),
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Get found items error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error retrieving found items',
      error: error.message 
    });
  }
};

// Get single found item by ID
export const getFoundItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT f.*, u.full_name, u.phone_number, u.email, u.role as uploader_role, u.id as uploader_id
       FROM found_items f
       JOIN users u ON f.user_id = u.id
       WHERE f.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Found item not found' 
      });
    }

    // Get matches for this item
    const matchesResult = await query(
      `SELECT m.*, l.item_type as lost_item_type, l.location_lost, l.date_lost, l.reward_amount,
              u.full_name as loser_name, u.phone_number as loser_phone
       FROM matches m
       JOIN lost_items l ON m.lost_item_id = l.id
       JOIN users u ON l.user_id = u.id
       WHERE m.found_item_id = $1
       ORDER BY m.matched_at DESC`,
      [id]
    );

    res.status(200).json({
      success: true,
      data: {
        foundItem: result.rows[0],
        matches: matchesResult.rows
      }
    });
  } catch (error) {
    console.error('Get found item error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error retrieving found item',
      error: error.message 
    });
  }
};

// Get user's own found items
export const getMyFoundItems = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    let whereClause = 'WHERE f.user_id = $1';
    const params = [userId];

    if (status) {
      whereClause += ' AND f.status = $2';
      params.push(status);
    }

    const result = await query(
      `SELECT f.*,
              (SELECT COUNT(*) FROM matches WHERE found_item_id = f.id) as match_count
       FROM found_items f
       ${whereClause}
       ORDER BY f.created_at DESC`,
      params
    );

    res.status(200).json({
      success: true,
      data: { foundItems: result.rows }
    });
  } catch (error) {
    console.error('Get my found items error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error retrieving your found items',
      error: error.message 
    });
  }
};

// Update found item
export const updateFoundItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { 
      item_type, category, description, location_found, district, 
      date_found, status, image_url, additional_info 
    } = req.body;

    // Check if item exists and belongs to user
    const checkResult = await query(
      'SELECT * FROM found_items WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Found item not found' 
      });
    }

    const item = checkResult.rows[0];

    // Only owner, police, or admin can update
    if (item.user_id !== userId && !['police', 'admin'].includes(req.user.role)) {
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
    if (location_found !== undefined) {
      updates.push(`location_found = $${paramCount++}`);
      values.push(location_found);
    }
    if (district !== undefined) {
      updates.push(`district = $${paramCount++}`);
      values.push(district);
    }
    if (date_found !== undefined) {
      updates.push(`date_found = $${paramCount++}`);
      values.push(date_found);
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
      `UPDATE found_items SET ${updates.join(', ')} 
       WHERE id = $${paramCount} 
       RETURNING *`,
      values
    );

    // Log audit
    await logAudit({
      userId,
      action: 'FOUND_ITEM_UPDATED',
      entityType: 'found_item',
      entityId: id,
      details: req.body,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(200).json({
      success: true,
      message: 'Found item updated successfully',
      data: { foundItem: result.rows[0] }
    });
  } catch (error) {
    console.error('Update found item error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error updating found item',
      error: error.message 
    });
  }
};

// Delete found item
export const deleteFoundItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if item exists and belongs to user
    const checkResult = await query(
      'SELECT * FROM found_items WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Found item not found' 
      });
    }

    const item = checkResult.rows[0];

    // Only owner, police, or admin can delete
    if (item.user_id !== userId && !['police', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: 'You do not have permission to delete this item' 
      });
    }

    await query('DELETE FROM found_items WHERE id = $1', [id]);

    // Log audit
    await logAudit({
      userId,
      action: 'FOUND_ITEM_DELETED',
      entityType: 'found_item',
      entityId: id,
      details: { item_type: item.item_type, category: item.category },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(200).json({
      success: true,
      message: 'Found item deleted successfully'
    });
  } catch (error) {
    console.error('Delete found item error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error deleting found item',
      error: error.message 
    });
  }
};

// Get dashboard statistics for finder
export const getFoundDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Total found items posted
    const totalResult = await query(
      'SELECT COUNT(*) FROM found_items WHERE user_id = $1',
      [userId]
    );

    // Active found items (not matched, not returned)
    const activeResult = await query(
      'SELECT COUNT(*) FROM found_items WHERE user_id = $1 AND status = $2',
      [userId, 'active']
    );

    // Matched items (waiting for confirmation/return)
    const matchedResult = await query(
      'SELECT COUNT(*) FROM found_items WHERE user_id = $1 AND status = $2',
      [userId, 'matched']
    );

    // Items returned
    const returnedResult = await query(
      'SELECT COUNT(*) FROM found_items WHERE user_id = $1 AND status = $2',
      [userId, 'returned']
    );

    // Total rewards earned (from completed matches with rewards paid)
    const rewardsResult = await query(
      `SELECT SUM(l.reward_amount) as total_rewards
       FROM matches m
       JOIN found_items f ON m.found_item_id = f.id
       JOIN lost_items l ON m.lost_item_id = l.id
       WHERE f.user_id = $1 AND m.status = 'completed' AND m.reward_paid = true`,
      [userId]
    );

    res.status(200).json({
      success: true,
      data: {
        totalFoundItems: parseInt(totalResult.rows[0].count),
        activeItems: parseInt(activeResult.rows[0].count),
        matchedItems: parseInt(matchedResult.rows[0].count),
        returnedItems: parseInt(returnedResult.rows[0].count),
        totalRewardsEarned: parseFloat(rewardsResult.rows[0].total_rewards || 0)
      }
    });
  } catch (error) {
    console.error('Get found dashboard stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error retrieving dashboard statistics',
      error: error.message 
    });
  }
};
