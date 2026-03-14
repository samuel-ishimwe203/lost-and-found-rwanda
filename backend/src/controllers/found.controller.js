import { query } from '../db/index.js';
import { logAudit } from '../services/audit.service.js';
import { checkForMatches, checkForDuplicatesInSection } from '../services/matching.service.js';
import { runOcr } from '../services/ocr.service.js';

export const postFoundItem = async (req, res) => {
  try {
    const { 
      item_type, category, description, location_found, district, 
      date_found, additional_info 
    } = req.body;
    const userId = req.user.id;
    const image_url = req.file ? (req.file.path.startsWith('http') ? req.file.path : `/uploads/${req.file.filename}`) : (req.body.image_url || null);
    let parsedAdditionalInfo = null;
    if (additional_info) {
      try {
        parsedAdditionalInfo = JSON.parse(additional_info);
      } catch (e) {
        parsedAdditionalInfo = {};
      }
    }

    // Run OCR on the uploaded image if available to auto-extract holder name / ID number
    let ocrName = null;
    let ocrIdNumber = null;
    let rawText = null;
    if (req.file) {
      try {
        const ocrResult = await runOcr(req.file.path);
        ocrName = ocrResult.name;
        ocrIdNumber = ocrResult.idNumber;
        rawText = ocrResult.rawText;
      } catch (e) {
        console.error('OCR error while processing found item:', e);
      }
    }
    if (!item_type || !category || !location_found || !district) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide all required fields: item_type, category, location_found, district' 
      });
    }
    if (!['finder', 'police'].includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: 'Only users with finder or police role can post found items' 
      });
    }
    const isPoliceUpload = req.user.role === 'police';
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
    const holderName = ocrName || parsedAdditionalInfo?.owner_name || null;
    const idNumber = ocrIdNumber || parsedAdditionalInfo?.id_number || null;

    const result = await query(
      `INSERT INTO found_items 
       (user_id, item_type, category, description, location_found, district, date_found, is_police_upload, image_url, additional_info, id_number, holder_name, text, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
       RETURNING *`,
      [
        userId,
        item_type,
        category,
        description,
        location_found,
        district,
        date_found,
        isPoliceUpload,
        image_url,
        parsedAdditionalInfo ? JSON.stringify(parsedAdditionalInfo) : null,
        idNumber,
        holderName,
        rawText
      ]
    );
    const foundItem = result.rows[0];
    await logAudit({
      userId,
      action: 'FOUND_ITEM_CREATED',
      entityType: 'found_item',
      entityId: foundItem.id,
      details: { item_type, category, district, is_police_upload: isPoliceUpload },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    const matches = await checkForMatches(foundItem.id, 'found');
    
    // Enrich matches with loser details for immediate display
    let enrichedMatches = [];
    if (matches && matches.length > 0) {
      const matchIds = matches.map(m => m.id);
      const enrichedResult = await query(
        `SELECT m.*, l.item_type as lost_item_type, l.category as lost_category, l.district as lost_district, 
                l.reward_amount, l.image_url as lost_image_url, l.text as lost_text, 
                l.additional_info as lost_additional_info, l.date_lost,
                u.full_name as loser_name, u.phone_number as loser_phone, u.email as loser_email, u.id as loser_id
         FROM matches m
         JOIN lost_items l ON m.lost_item_id = l.id
         JOIN users u ON l.user_id = u.id
         WHERE m.id = ANY($1::int[])`,
        [matchIds]
      );
      enrichedMatches = enrichedResult.rows;
    }

    res.status(201).json({
      success: true,
      message: enrichedMatches.length > 0 
        ? `Found item posted! We found ${enrichedMatches.length} potential matches.` 
        : 'Found item posted successfully',
      data: { 
        foundItem,
        matches: enrichedMatches
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error posting found item',
      error: error.message 
    });
  }
}

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
    res.status(500).json({ 
      success: false,
      message: 'Server error retrieving found items',
      error: error.message 
    });
  }
}

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
    res.status(500).json({ 
      success: false,
      message: 'Server error retrieving found item',
      error: error.message 
    });
  }
}

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
    res.status(500).json({ 
      success: false,
      message: 'Server error retrieving your found items',
      error: error.message 
    });
  }
}

export const updateFoundItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { 
      date_found, status, image_url, additional_info 
    } = req.body;
    
    // Handle image upload if present
    let finalImageUrl = image_url;
    if (req.file) {
      finalImageUrl = req.file.path.startsWith('http') ? req.file.path : `/uploads/${req.file.filename}`;
    }
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
    if (finalImageUrl !== undefined) {
      updates.push(`image_url = $${paramCount++}`);
      values.push(finalImageUrl);
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
    res.status(500).json({ 
      success: false,
      message: 'Server error updating found item',
      error: error.message 
    });
  }
}

export const deleteFoundItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
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
    // If it's an admin or uploader, perform a cascading delete of all related records
    // 1. Get all match IDs for this found item
    const matchesResult = await query('SELECT id FROM matches WHERE found_item_id = $1', [id]);
    const matchIds = matchesResult.rows.map(m => m.id);

    if (matchIds.length > 0) {
      // 2. Delete messages related to these matches
      await query('DELETE FROM messages WHERE match_id = ANY($1::int[])', [matchIds]);
      // 3. Delete notifications related to these matches
      await query('DELETE FROM notifications WHERE related_match_id = ANY($1::int[])', [matchIds]);
      // 4. Delete the matches themselves
      await query('DELETE FROM matches WHERE id = ANY($1::int[])', [matchIds]);
    }

    // 5. Delete notifications directly related to this found item
    await query('DELETE FROM notifications WHERE related_found_item_id = $1', [id]);

    // 6. Finally delete the found item
    await query('DELETE FROM found_items WHERE id = $1', [id]);
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
    res.status(500).json({ 
      success: false,
      message: 'Server error deleting found item',
      error: error.message 
    });
  }
}

export const getFoundDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const totalResult = await query(
      'SELECT COUNT(*) FROM found_items WHERE user_id = $1',
      [userId]
    );
    const activeResult = await query(
      'SELECT COUNT(*) FROM found_items WHERE user_id = $1 AND status = $2',
      [userId, 'active']
    );
    const matchedResult = await query(
      'SELECT COUNT(*) FROM found_items WHERE user_id = $1 AND status = $2',
      [userId, 'matched']
    );
    const returnedResult = await query(
      'SELECT COUNT(*) FROM found_items WHERE user_id = $1 AND status = $2',
      [userId, 'returned']
    );
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
    res.status(500).json({ 
      success: false,
      message: 'Server error retrieving dashboard statistics',
      error: error.message 
    });
  }
}