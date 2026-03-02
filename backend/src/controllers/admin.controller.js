import bcrypt from 'bcryptjs';
import { query } from '../db/index.js';
import { logAudit, getAuditLogs } from '../services/audit.service.js';

// Get all users (admin only)
export const getUsers = async (req, res) => {
  try {
    const { role, is_active, search } = req.query;

    let whereConditions = [];
    let params = [];
    let paramCount = 1;

    if (role) {
      whereConditions.push(`role = $${paramCount++}`);
      params.push(role);
    }

    if (is_active !== undefined) {
      whereConditions.push(`is_active = $${paramCount++}`);
      params.push(is_active === 'true');
    }

    if (search) {
      whereConditions.push(`(full_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`);
      params.push(`%${search}%`);
      paramCount++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const result = await query(
      `SELECT id, email, full_name, phone_number, role, language_preference, 
              is_active, created_at, created_by
       FROM users
       ${whereClause}
       ORDER BY created_at DESC`,
      params
    );

    res.status(200).json({
      success: true,
      data: { users: result.rows }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error retrieving users',
      error: error.message 
    });
  }
};

// Create police or admin account (admin only)
export const createOfficialAccount = async (req, res) => {
  try {
    const { email, password, full_name, phone_number, role } = req.body;
    const adminId = req.user.id;

    // Only admin and police roles can be created by admin
    if (!['police', 'admin'].includes(role)) {
      return res.status(400).json({ 
        success: false,
        message: 'Can only create police or admin accounts through this endpoint' 
      });
    }

    // Check if user exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: 'User with this email already exists' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user - ADDED created_at and updated_at explicitly to fix NOT NULL constraint
    const result = await query(
      `INSERT INTO users (email, password, full_name, phone_number, role, created_by, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id, email, full_name, phone_number, role, created_at`,
      [email, hashedPassword, full_name, phone_number, role, adminId, true]
    );

    const user = result.rows[0];

    // Log audit
    await logAudit({
      userId: adminId,
      action: 'USER_CREATED_BY_ADMIN',
      entityType: 'user',
      entityId: user.id,
      details: { email, role },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(201).json({
      success: true,
      message: `${role} account created successfully`,
      data: { user }
    });
  } catch (error) {
    console.error('Create official account error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error creating account',
      error: error.message 
    });
  }
};

// Update user (activate/deactivate, change role)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active, role } = req.body;
    const adminId = req.user.id;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(is_active);
    }

    if (role) {
      updates.push(`role = $${paramCount++}`);
      values.push(role);
    }

    if (updates.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'No fields to update' 
      });
    }

    values.push(id);

    const result = await query(
      `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING id, email, full_name, role, is_active`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Log audit
    await logAudit({
      userId: adminId,
      action: 'USER_UPDATED_BY_ADMIN',
      entityType: 'user',
      entityId: id,
      details: req.body,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: { user: result.rows[0] }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error updating user',
      error: error.message 
    });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    // Cannot delete yourself
    if (parseInt(id) === adminId) {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot delete your own account' 
      });
    }

    await query('DELETE FROM users WHERE id = $1', [id]);

    // Log audit
    await logAudit({
      userId: adminId,
      action: 'USER_DELETED_BY_ADMIN',
      entityType: 'user',
      entityId: id,
      details: {},
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error deleting user',
      error: error.message 
    });
  }
};

// Get system statistics
export const getSystemStats = async (req, res) => {
  try {
    // Total users
    const usersResult = await query('SELECT COUNT(*) FROM users');
    const totalUsers = parseInt(usersResult.rows[0].count);

    // Users by role
    const losersResult = await query('SELECT COUNT(*) FROM users WHERE role = $1', ['loser']);
    const findersResult = await query('SELECT COUNT(*) FROM users WHERE role = $1', ['finder']);
    const policeResult = await query('SELECT COUNT(*) FROM users WHERE role = $1', ['police']);
    const adminsResult = await query('SELECT COUNT(*) FROM users WHERE role = $1', ['admin']);

    // Lost items
    const lostItemsResult = await query('SELECT COUNT(*) FROM lost_items');
    const activeLostResult = await query('SELECT COUNT(*) FROM lost_items WHERE status = $1', ['active']);
    const matchedLostResult = await query('SELECT COUNT(*) FROM lost_items WHERE status = $1', ['matched']);
    const resolvedLostResult = await query('SELECT COUNT(*) FROM lost_items WHERE status = $1', ['resolved']);

    // Found items
    const foundItemsResult = await query('SELECT COUNT(*) FROM found_items');
    const activeFoundResult = await query('SELECT COUNT(*) FROM found_items WHERE status = $1', ['active']);
    const policeFoundResult = await query('SELECT COUNT(*) FROM found_items WHERE is_police_upload = true');

    // Matches
    const matchesResult = await query('SELECT COUNT(*) FROM matches');
    const pendingMatchesResult = await query('SELECT COUNT(*) FROM matches WHERE status = $1', ['pending']);
    const confirmedMatchesResult = await query('SELECT COUNT(*) FROM matches WHERE status = $1', ['confirmed']);
    const completedMatchesResult = await query('SELECT COUNT(*) FROM matches WHERE status = $1', ['completed']);

    // Total rewards
    const rewardsResult = await query('SELECT SUM(reward_amount) as total FROM lost_items WHERE status != $1', ['closed']);
    const paidRewardsResult = await query(
      `SELECT SUM(l.reward_amount) as total
       FROM matches m
       JOIN lost_items l ON m.lost_item_id = l.id
       WHERE m.reward_paid = true`
    );

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          losers: parseInt(losersResult.rows[0].count),
          finders: parseInt(findersResult.rows[0].count),
          police: parseInt(policeResult.rows[0].count),
          admins: parseInt(adminsResult.rows[0].count)
        },
        lostItems: {
          total: parseInt(lostItemsResult.rows[0].count),
          active: parseInt(activeLostResult.rows[0].count),
          matched: parseInt(matchedLostResult.rows[0].count),
          resolved: parseInt(resolvedLostResult.rows[0].count)
        },
        foundItems: {
          total: parseInt(foundItemsResult.rows[0].count),
          active: parseInt(activeFoundResult.rows[0].count),
          policeUploads: parseInt(policeFoundResult.rows[0].count)
        },
        matches: {
          total: parseInt(matchesResult.rows[0].count),
          pending: parseInt(pendingMatchesResult.rows[0].count),
          confirmed: parseInt(confirmedMatchesResult.rows[0].count),
          completed: parseInt(completedMatchesResult.rows[0].count)
        },
        rewards: {
          totalOffered: parseFloat(rewardsResult.rows[0].total || 0),
          totalPaid: parseFloat(paidRewardsResult.rows[0].total || 0)
        }
      }
    });
  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error retrieving system statistics',
      error: error.message 
    });
  }
};

// Get audit logs
export const getLogs = async (req, res) => {
  try {
    const { userId, action, entityType, startDate, endDate, limit } = req.query;

    const logs = await getAuditLogs({
      userId,
      action,
      entityType,
      startDate,
      endDate,
      limit: limit ? parseInt(limit) : 100
    });

    res.status(200).json({
      success: true,
      data: { logs }
    });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error retrieving logs',
      error: error.message 
    });
  }
};

// Get all items (both lost and found) for admin overview
export const getAllItems = async (req, res) => {
  try {
    const { status, district, category } = req.query;

    let whereConditions = [];
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

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get lost items
    const lostItems = await query(
      `SELECT l.*, u.full_name, u.email, 'lost' as item_source
       FROM lost_items l
       JOIN users u ON l.user_id = u.id
       ${whereClause}
       ORDER BY l.created_at DESC
       LIMIT 50`,
      params
    );

    // Get found items
    const foundItems = await query(
      `SELECT f.*, u.full_name, u.email, 'found' as item_source
       FROM found_items f
       JOIN users u ON f.user_id = u.id
       ${whereClause}
       ORDER BY f.created_at DESC
       LIMIT 50`,
      params
    );

    res.status(200).json({
      success: true,
      data: {
        lostItems: lostItems.rows,
        foundItems: foundItems.rows
      }
    });
  } catch (error) {
    console.error('Get all items error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error retrieving items',
      error: error.message 
    });
  }
};

// Get all matches for admin
export const getAllMatches = async (req, res) => {
  try {
    const { status } = req.query;

    let whereClause = '';
    const params = [];

    if (status) {
      whereClause = 'WHERE m.status = $1';
      params.push(status);
    }

    const result = await query(
      `SELECT m.*, 
              l.item_type as lost_item_type, l.reward_amount,
              f.item_type as found_item_type, f.is_police_upload,
              loser.full_name as loser_name, loser.email as loser_email,
              finder.full_name as finder_name, finder.email as finder_email
       FROM matches m
       JOIN lost_items l ON m.lost_item_id = l.id
       JOIN found_items f ON m.found_item_id = f.id
       JOIN users loser ON l.user_id = loser.id
       JOIN users finder ON f.user_id = finder.id
       ${whereClause}
       ORDER BY m.matched_at DESC`,
      params
    );

    res.status(200).json({
      success: true,
      data: { matches: result.rows }
    });
  } catch (error) {
    console.error('Get all matches error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error retrieving matches',
      error: error.message 
    });
  }
};

// Get pending police registration requests
export const getPendingPoliceRegistrations = async (req, res) => {
  try {
    const result = await query(
      `SELECT pp.*, u.id as user_id, u.email, u.full_name, u.phone_number, u.created_at
       FROM police_profiles pp
       JOIN users u ON pp.user_id = u.id
       WHERE pp.is_verified = false
       ORDER BY u.created_at DESC`
    );

    res.status(200).json({
      success: true,
      data: { 
        pendingRequests: result.rows,
        count: result.rows.length
      }
    });
  } catch (error) {
    console.error('Get pending police registrations error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error retrieving pending police registrations',
      error: error.message 
    });
  }
};

// Approve police registration
export const approvePoliceRegistration = async (req, res) => {
  try {
    const { police_profile_id } = req.params;
    const { remarks } = req.body;
    const adminId = req.user.id;

    // Get police profile and user
    const profileResult = await query(
      'SELECT * FROM police_profiles WHERE id = $1',
      [police_profile_id]
    );

    if (profileResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Police profile not found' 
      });
    }

    const profile = profileResult.rows[0];

    // Get user
    const userResult = await query(
      'SELECT * FROM users WHERE id = $1',
      [profile.user_id]
    );

    const user = userResult.rows[0];

    // Update police profile to verified
    const updateProfileResult = await query(
      `UPDATE police_profiles 
       SET is_verified = true, verified_by = $1, verified_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [adminId, police_profile_id]
    );

    // Update user to active
    await query(
      'UPDATE users SET is_active = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [profile.user_id]
    );

    // Send notification to police officer
    try {
      await query(
        `INSERT INTO messages (sender_id, receiver_id, subject, message, is_read, created_at)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
        [
          adminId,
          profile.user_id,
          'Police Registration Approved',
          `Your police officer registration has been approved by the admin. Your official documents have been verified. You can now login to your account. ${remarks ? '\n\nAdmin Remarks: ' + remarks : ''}`
        ]
      );
    } catch (msgError) {
      console.error('Error sending approval message:', msgError);
      // Continue even if message fails
    }

    // Log audit
    await logAudit({
      userId: adminId,
      action: 'POLICE_REGISTRATION_APPROVED',
      entityType: 'police_profile',
      entityId: police_profile_id,
      details: { badge_number: profile.badge_number, police_station: profile.police_station, remarks },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(200).json({
      success: true,
      message: 'Police registration approved successfully',
      data: { 
        profile: updateProfileResult.rows[0],
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          is_active: true
        }
      }
    });
  } catch (error) {
    console.error('Approve police registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error approving police registration',
      error: error.message 
    });
  }
};

// Reject police registration
export const rejectPoliceRegistration = async (req, res) => {
  try {
    const { police_profile_id } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    if (!reason) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide a reason for rejection' 
      });
    }

    // Get police profile and user
    const profileResult = await query(
      'SELECT * FROM police_profiles WHERE id = $1',
      [police_profile_id]
    );

    if (profileResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Police profile not found' 
      });
    }

    const profile = profileResult.rows[0];

    // Get user
    const userResult = await query(
      'SELECT * FROM users WHERE id = $1',
      [profile.user_id]
    );

    const user = userResult.rows[0];

    // Send rejection notification to police officer
    try {
      await query(
        `INSERT INTO messages (sender_id, receiver_id, subject, message, is_read, created_at)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
        [
          adminId,
          profile.user_id,
          'Police Registration Rejected',
          `Your police officer registration has been rejected. Reason: ${reason}\n\nPlease resubmit with correct official documents or contact the admin for more information.`
        ]
      );
    } catch (msgError) {
      console.error('Error sending rejection message:', msgError);
      // Continue with deletion even if message fails
    }

    // Delete police profile and user account
    await query('DELETE FROM police_profiles WHERE id = $1', [police_profile_id]);
    await query('DELETE FROM users WHERE id = $1', [profile.user_id]);

    // Log audit
    await logAudit({
      userId: adminId,
      action: 'POLICE_REGISTRATION_REJECTED',
      entityType: 'police_profile',
      entityId: police_profile_id,
      details: { badge_number: profile.badge_number, police_station: profile.police_station, reason },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(200).json({
      success: true,
      message: 'Police registration rejected successfully',
      data: { 
        rejectedUser: {
          id: user.id,
          email: user.email,
          full_name: user.full_name
        }
      }
    });
  } catch (error) {
    console.error('Reject police registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error rejecting police registration',
      error: error.message 
    });
  }
};