import { query } from '../db/index.js';

// Log audit action
export const logAudit = async ({userId, action, entityType, entityId, details, ipAddress, userAgent}) => {
  try {
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId, action, entityType, entityId, JSON.stringify(details), ipAddress, userAgent]
    );
  } catch (error) {
    console.error('Audit log error:', error);
    // Don't throw - audit failures shouldn't break the app
  }
};

// Get audit logs with filters
export const getAuditLogs = async (filters = {}) => {
  try {
    const { userId, action, entityType, startDate, endDate, limit = 100, offset = 0 } = filters;

    let whereConditions = [];
    let params = [];
    let paramCount = 1;

    if (userId) {
      whereConditions.push(`user_id = $${paramCount++}`);
      params.push(userId);
    }

    if (action) {
      whereConditions.push(`action = $${paramCount++}`);
      params.push(action);
    }

    if (entityType) {
      whereConditions.push(`entity_type = $${paramCount++}`);
      params.push(entityType);
    }

    if (startDate) {
      whereConditions.push(`created_at >= $${paramCount++}`);
      params.push(startDate);
    }

    if (endDate) {
      whereConditions.push(`created_at <= $${paramCount++}`);
      params.push(endDate);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    params.push(limit, offset);

    const result = await query(
      `SELECT al.*, u.email, u.full_name 
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ${whereClause}
       ORDER BY al.created_at DESC
       LIMIT $${paramCount++} OFFSET $${paramCount}`,
      params
    );

    return result.rows;
  } catch (error) {
    console.error('Get audit logs error:', error);
    throw error;
  }
};

// Get audit logs for a specific user
export const getUserAuditLogs = async (userId, limit = 50) => {
  return getAuditLogs({ userId, limit });
};

// Get recent system activities
export const getRecentActivities = async (limit = 20) => {
  try {
    const result = await query(
      `SELECT al.*, u.email, u.full_name 
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ORDER BY al.created_at DESC
       LIMIT $1`,
      [limit]
    );

    return result.rows;
  } catch (error) {
    console.error('Get recent activities error:', error);
    throw error;
  }
};
