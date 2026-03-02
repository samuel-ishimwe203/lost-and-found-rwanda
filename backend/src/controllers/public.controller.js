import { query } from '../db/index.js';

export const getItems = async (req, res) => {
  try {
    const { type, district, category, search, limit = '50', offset = '0' } = req.query;
    
    const limitInt = parseInt(limit, 10);
    const offsetInt = parseInt(offset, 10);

    if (type && !['lost', 'found', 'all'].includes(type)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid type parameter. Use: lost, found, or all' 
      });
    }

    let lostItems = [];
    let foundItems = [];

    let whereConditions = [];
    let params = [];
    let paramCount = 1;

    if (district) {
      whereConditions.push(`district = $${paramCount++}`);
      params.push(district);
    }

    if (category) {
      whereConditions.push(`category = $${paramCount++}`);
      params.push(category);
    }

    if (search) {
      whereConditions.push(`(item_type ILIKE $${paramCount} OR description ILIKE $${paramCount})`);
      params.push(`%${search}%`);
      paramCount++;
    }

    whereConditions.push(`status = 'active'`);

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    if (!type || type === 'lost' || type === 'all') {
      const lostParams = [...params];
      const limitParamIndex = paramCount;
      const offsetParamIndex = paramCount + 1;
      lostParams.push(limitInt, offsetInt);
      
      const lostResult = await query(
        `SELECT l.id, l.item_type, l.category, l.description, l.location_lost as location, 
                l.district, l.date_lost as date, l.reward_amount, l.image_url, l.created_at,
                l.additional_info, l.user_id, u.full_name as contact_name, u.phone_number as contact_phone
         FROM lost_items l
         JOIN users u ON l.user_id = u.id
         ${whereClause}
         ORDER BY l.created_at DESC
         LIMIT $${limitParamIndex} OFFSET $${offsetParamIndex}`,
        lostParams
      );
      lostItems = lostResult.rows.map(item => ({ ...item, item_source: 'lost' }));
    }

    if (!type || type === 'found' || type === 'all') {
      const foundParams = [...params];
      const limitParamIndex = paramCount;
      const offsetParamIndex = paramCount + 1;
      foundParams.push(limitInt, offsetInt);
      
      const foundResult = await query(
        `SELECT f.id, f.item_type, f.category, f.description, f.location_found as location, 
                f.district, f.date_found as date, f.is_police_upload, f.image_url, f.created_at,
                f.additional_info, f.user_id, u.full_name as contact_name, u.phone_number as contact_phone, u.role as uploader_role
         FROM found_items f
         JOIN users u ON f.user_id = u.id
         ${whereClause}
         ORDER BY f.created_at DESC
         LIMIT $${limitParamIndex} OFFSET $${offsetParamIndex}`,
        foundParams
      );
      foundItems = foundResult.rows.map(item => ({ ...item, item_source: 'found' }));
    }

    res.status(200).json({
      success: true,
      data: {
        lostItems,
        foundItems,
        total: lostItems.length + foundItems.length
      }
    });
  } catch (error) {
    console.error('Get public items error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error retrieving items',
      error: error.message 
    });
  }
};

export const getItemById = async (req, res) => {
  try {
    const { type, id } = req.params;

    if (!['lost', 'found'].includes(type)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid type. Use: lost or found' 
      });
    }

    let result;

    if (type === 'lost') {
      result = await query(
        `SELECT l.id, l.item_type, l.category, l.description, l.location_lost as location, 
                l.district, l.date_lost as date, l.reward_amount, l.image_url, l.status, l.created_at,
                l.additional_info, l.user_id, u.full_name as contact_name, u.phone_number as contact_phone
         FROM lost_items l
         JOIN users u ON l.user_id = u.id
         WHERE l.id = $1`,
        [id]
      );
    } else {
      result = await query(
        `SELECT f.id, f.item_type, f.category, f.description, f.location_found as location, 
                f.district, f.date_found as date, f.is_police_upload, f.image_url, f.status, f.created_at,
                f.additional_info, f.user_id, u.full_name as contact_name, u.phone_number as contact_phone, u.role as uploader_role
         FROM found_items f
         JOIN users u ON f.user_id = u.id
         WHERE f.id = $1`,
        [id]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Item not found' 
      });
    }

    res.status(200).json({
      success: true,
      data: {
        item: result.rows[0],
        item_source: type
      }
    });
  } catch (error) {
    console.error('Get item by ID error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error retrieving item',
      error: error.message 
    });
  }
};

export const searchItems = async (req, res) => {
  try {
    const { district, category, item_type, date_from, date_to } = req.body;

    let whereConditions = ['status = $1'];
    let params = ['active'];
    let paramCount = 2;

    if (district) {
      whereConditions.push(`district = $${paramCount++}`);
      params.push(district);
    }

    if (category) {
      whereConditions.push(`category = $${paramCount++}`);
      params.push(category);
    }

    if (item_type) {
      whereConditions.push(`item_type ILIKE $${paramCount++}`);
      params.push(`%${item_type}%`);
    }

    const whereClause = whereConditions.join(' AND ');

    let lostQuery = `
      SELECT l.id, l.item_type, l.category, l.description, l.location_lost as location, 
             l.district, l.date_lost as date, l.reward_amount, l.image_url, l.created_at,
             'lost' as item_source
      FROM lost_items l
      WHERE ${whereClause}
    `;

    if (date_from) {
      lostQuery += ` AND l.date_lost >= $${paramCount}`;
      params.push(date_from);
      paramCount++;
    }

    if (date_to) {
      lostQuery += ` AND l.date_lost <= $${paramCount}`;
      params.push(date_to);
      paramCount++;
    }

    lostQuery += ' ORDER BY l.created_at DESC LIMIT 50';

    const lostResult = await query(lostQuery, params);

    params = ['active'];
    paramCount = 2;
    whereConditions = ['status = $1'];

    if (district) {
      whereConditions.push(`district = $${paramCount++}`);
      params.push(district);
    }

    if (category) {
      whereConditions.push(`category = $${paramCount++}`);
      params.push(category);
    }

    if (item_type) {
      whereConditions.push(`item_type ILIKE $${paramCount++}`);
      params.push(`%${item_type}%`);
    }

    const whereClause2 = whereConditions.join(' AND ');

    let foundQuery = `
      SELECT f.id, f.item_type, f.category, f.description, f.location_found as location, 
             f.district, f.date_found as date, f.is_police_upload, f.image_url, f.created_at,
             'found' as item_source
      FROM found_items f
      WHERE ${whereClause2}
    `;

    if (date_from) {
      foundQuery += ` AND f.date_found >= $${paramCount}`;
      params.push(date_from);
      paramCount++;
    }

    if (date_to) {
      foundQuery += ` AND f.date_found <= $${paramCount}`;
      params.push(date_to);
      paramCount++;
    }

    foundQuery += ' ORDER BY f.created_at DESC LIMIT 50';

    const foundResult = await query(foundQuery, params);

    res.status(200).json({
      success: true,
      data: {
        lostItems: lostResult.rows,
        foundItems: foundResult.rows,
        total: lostResult.rows.length + foundResult.rows.length
      }
    });
  } catch (error) {
    console.error('Search items error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error searching items',
      error: error.message 
    });
  }
};

export const getPublicStats = async (req, res) => {
  try {
    const lostResult = await query('SELECT COUNT(*) FROM lost_items WHERE status = $1', ['active']);
    const foundResult = await query('SELECT COUNT(*) FROM found_items WHERE status = $1', ['active']);
    const matchesResult = await query('SELECT COUNT(*) FROM matches WHERE status = $1', ['completed']);
    const rewardsResult = await query(
      `SELECT SUM(l.reward_amount) as total
       FROM matches m
       JOIN lost_items l ON m.lost_item_id = l.id
       WHERE m.status = 'completed' AND m.reward_paid = true`
    );

    res.status(200).json({
      success: true,
      data: {
        activeLostItems: parseInt(lostResult.rows[0].count),
        activeFoundItems: parseInt(foundResult.rows[0].count),
        successfulMatches: parseInt(matchesResult.rows[0].count),
        totalRewardsPaid: parseFloat(rewardsResult.rows[0].total || 0)
      }
    });
  } catch (error) {
    console.error('Get public stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error retrieving statistics',
      error: error.message 
    });
  }
};