import { query } from '../db/index.js';
import { logAudit } from '../services/audit.service.js';
import { checkForMatches } from '../services/matching.service.js';

// Post official document/item found at police station
export const postOfficialDocument = async (req, res) => {
  try {
    const { 
      item_type, category, description, location_found, district, 
      date_found, image_url, additional_info 
    } = req.body;
    const userId = req.user.id;

    // Only police can use this endpoint
    if (req.user.role !== 'police') {
      return res.status(403).json({ 
        success: false,
        message: 'Only police users can post official documents' 
      });
    }

    // Validate required fields
    if (!item_type || !category || !location_found || !district) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide all required fields' 
      });
    }

    // Create found item with police flag
    const result = await query(
      `INSERT INTO found_items 
       (user_id, item_type, category, description, location_found, district, date_found, is_police_upload, image_url, additional_info) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [userId, item_type, category, description, location_found, district, date_found, true, image_url, additional_info ? JSON.stringify(additional_info) : null]
    );

    const foundItem = result.rows[0];

    // Log audit
    await logAudit({
      userId,
      action: 'POLICE_DOCUMENT_POSTED',
      entityType: 'found_item',
      entityId: foundItem.id,
      details: { item_type, category, district },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    // Check for potential matches
    await checkForMatches(foundItem.id, 'found');

    res.status(201).json({
      success: true,
      message: 'Official document posted successfully',
      data: { foundItem }
    });
  } catch (error) {
    console.error('Post official document error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error posting document',
      error: error.message 
    });
  }
};

// Get all police-uploaded items
export const getPoliceItems = async (req, res) => {
  try {
    const { status, district, category } = req.query;

    let whereConditions = ['is_police_upload = true'];
    let params = [];
    let paramCount = 1;

    if (status) {
      whereConditions.push(`status = $${paramCount++}`);
      params.push(status);
    }

    if (district) {
      whereConditions.push(`district = $${paramCount++}`);
      params.push(district);
    }

    if (category) {
      whereConditions.push(`category = $${paramCount++}`);
      params.push(category);
    }

    const whereClause = whereConditions.join(' AND ');

    const result = await query(
      `SELECT f.*, u.full_name, u.phone_number,
              (SELECT COUNT(*) FROM matches WHERE found_item_id = f.id) as match_count
       FROM found_items f
       JOIN users u ON f.user_id = u.id
       WHERE ${whereClause}
       ORDER BY f.created_at DESC`,
      params
    );

    res.status(200).json({
      success: true,
      data: { items: result.rows }
    });
  } catch (error) {
    console.error('Get police items error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error retrieving police items',
      error: error.message 
    });
  }
};

// Get claims/matches for police items
export const manageClaims = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    let whereConditions = ['f.user_id = $1', 'f.is_police_upload = true'];
    let params = [userId];
    let paramCount = 2;

    if (status) {
      whereConditions.push(`m.status = $${paramCount++}`);
      params.push(status);
    }

    const whereClause = whereConditions.join(' AND ');

    const result = await query(
      `SELECT m.*, 
              f.item_type as found_item_type, f.location_found,
              l.item_type as lost_item_type, l.reward_amount,
              loser.full_name as claimer_name, loser.phone_number as claimer_phone, loser.email as claimer_email
       FROM matches m
       JOIN found_items f ON m.found_item_id = f.id
       JOIN lost_items l ON m.lost_item_id = l.id
       JOIN users loser ON l.user_id = loser.id
       WHERE ${whereClause}
       ORDER BY m.matched_at DESC`,
      params
    );

    res.status(200).json({
      success: true,
      data: { claims: result.rows }
    });
  } catch (error) {
    console.error('Manage claims error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error retrieving claims',
      error: error.message 
    });
  }
};

// Get returned/completed documents
export const getReturnedDocuments = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await query(
      `SELECT f.*, m.resolved_at, m.reward_paid,
              loser.full_name as owner_name, loser.phone_number as owner_phone
       FROM found_items f
       JOIN matches m ON f.id = m.found_item_id
       JOIN lost_items l ON m.lost_item_id = l.id
       JOIN users loser ON l.user_id = loser.id
       WHERE f.user_id = $1 
       AND f.is_police_upload = true 
       AND f.status = 'returned'
       AND m.status = 'completed'
       ORDER BY m.resolved_at DESC`,
      [userId]
    );

    res.status(200).json({
      success: true,
      data: { returnedDocuments: result.rows }
    });
  } catch (error) {
    console.error('Get returned documents error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error retrieving returned documents',
      error: error.message 
    });
  }
};

// Get police dashboard statistics
export const getPoliceDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Total police uploads
    const totalResult = await query(
      'SELECT COUNT(*) FROM found_items WHERE user_id = $1 AND is_police_upload = true',
      [userId]
    );

    // Active items
    const activeResult = await query(
      'SELECT COUNT(*) FROM found_items WHERE user_id = $1 AND is_police_upload = true AND status = $2',
      [userId, 'active']
    );

    // Matched items
    const matchedResult = await query(
      'SELECT COUNT(*) FROM found_items WHERE user_id = $1 AND is_police_upload = true AND status = $2',
      [userId, 'matched']
    );

    // Returned items
    const returnedResult = await query(
      'SELECT COUNT(*) FROM found_items WHERE user_id = $1 AND is_police_upload = true AND status = $2',
      [userId, 'returned']
    );

    // Pending claims
    const pendingClaimsResult = await query(
      `SELECT COUNT(*) FROM matches m
       JOIN found_items f ON m.found_item_id = f.id
       WHERE f.user_id = $1 AND f.is_police_upload = true AND m.status = 'pending'`,
      [userId]
    );

    res.status(200).json({
      success: true,
      data: {
        totalUploads: parseInt(totalResult.rows[0].count),
        activeItems: parseInt(activeResult.rows[0].count),
        matchedItems: parseInt(matchedResult.rows[0].count),
        returnedItems: parseInt(returnedResult.rows[0].count),
        pendingClaims: parseInt(pendingClaimsResult.rows[0].count)
      }
    });
  } catch (error) {
    console.error('Get police dashboard stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error retrieving dashboard statistics',
      error: error.message 
    });
  }
};
