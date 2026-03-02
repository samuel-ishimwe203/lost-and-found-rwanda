import { query } from '../db/index.js';
import { createNotification } from './notification.service.js';
import { logAudit } from './audit.service.js';

const analyzeImageSimilarity = async (lostImageUrl, foundImageUrl) => {
  try {
    if (!lostImageUrl || !foundImageUrl) return 0;
    if (lostImageUrl === foundImageUrl) return 100;
    return 50; 
  } catch (error) {
    console.error(error);
    return 0; 
  }
};

export const checkForDuplicatesInSection = async (itemData, itemType) => {
  try {
    const { category, image_url } = itemData;
    if (!image_url || image_url.trim() === '') return null;

    let existingItems;
    if (itemType === 'lost') {
      const result = await query(
        `SELECT l.*, u.full_name, u.phone_number
         FROM lost_items l
         JOIN users u ON l.user_id = u.id
         WHERE l.category = $1 AND l.image_url = $2 AND l.status IN ('active', 'pending') LIMIT 5`,
        [category, image_url]
      );
      existingItems = result.rows;
    } else if (itemType === 'found') {
      const result = await query(
        `SELECT f.*, u.full_name, u.phone_number
         FROM found_items f
         JOIN users u ON f.user_id = u.id
         WHERE f.category = $1 AND f.image_url = $2 AND f.status IN ('active', 'pending') LIMIT 5`,
        [category, image_url]
      );
      existingItems = result.rows;
    }

    if (existingItems && existingItems.length > 0) {
      return {
        isDuplicate: true,
        existingItem: existingItems[0],
        message: `This item already exists. Posted by ${existingItems[0].full_name}. Contact: ${existingItems[0].phone_number}`
      };
    }
    return null;
  } catch (error) {
    console.error(error);
    return null; 
  }
};

export const checkForMatches = async (itemId, itemType) => {
  try {
    let matches = [];
    if (itemType === 'lost') {
      const lostItemResult = await query('SELECT * FROM lost_items WHERE id = $1', [itemId]);
      if (lostItemResult.rows.length === 0) return;
      const lostItem = lostItemResult.rows[0];

      const foundItemsResult = await query(
        `SELECT f.*, u.id as finder_id, u.full_name as finder_name
         FROM found_items f
         JOIN users u ON f.user_id = u.id
         WHERE f.category = $1 AND f.status = 'active'`,
        [lostItem.category]
      );

      for (const foundItem of foundItemsResult.rows) {
        const matchScore = await calculateMatchScore(lostItem, foundItem);
        if (matchScore >= 60) {
          const existingMatch = await query(
            'SELECT id FROM matches WHERE lost_item_id = $1 AND found_item_id = $2',
            [lostItem.id, foundItem.id]
          );

          if (existingMatch.rows.length === 0) {
            const matchResult = await query(
              `INSERT INTO matches (lost_item_id, found_item_id, match_score, status)
               VALUES ($1, $2, $3, 'pending') RETURNING *`,
              [lostItem.id, foundItem.id, matchScore]
            );

            const match = matchResult.rows[0];
            await query('UPDATE lost_items SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', ['matched', lostItem.id]);
            await query('UPDATE found_items SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', ['matched', foundItem.id]);

            await notifyMatch(match, lostItem, foundItem);
            matches.push(match);
          }
        }
      }
    } else if (itemType === 'found') {
      const foundItemResult = await query('SELECT * FROM found_items WHERE id = $1', [itemId]);
      if (foundItemResult.rows.length === 0) return;
      const foundItem = foundItemResult.rows[0];

      const lostItemsResult = await query(
        `SELECT l.*, u.id as loser_id, u.full_name as loser_name
         FROM lost_items l
         JOIN users u ON l.user_id = u.id
         WHERE l.category = $1 AND l.status = 'active'`,
        [foundItem.category]
      );

      for (const lostItem of lostItemsResult.rows) {
        const matchScore = await calculateMatchScore(lostItem, foundItem);
        if (matchScore >= 60) {
          const existingMatch = await query(
            'SELECT id FROM matches WHERE lost_item_id = $1 AND found_item_id = $2',
            [lostItem.id, foundItem.id]
          );

          if (existingMatch.rows.length === 0) {
            const matchResult = await query(
              `INSERT INTO matches (lost_item_id, found_item_id, match_score, status)
               VALUES ($1, $2, $3, 'pending') RETURNING *`,
              [lostItem.id, foundItem.id, matchScore]
            );

            const match = matchResult.rows[0];
            await query('UPDATE lost_items SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', ['matched', lostItem.id]);
            await query('UPDATE found_items SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', ['matched', foundItem.id]);

            await notifyMatch(match, lostItem, foundItem);
            matches.push(match);
          }
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
};

export const scanExactDuplicates = async () => {
  try {
    const lostItemsResult = await query(
      `SELECT id, user_id, item_type, category, district, image_url, date_lost, reward_amount
       FROM lost_items 
       WHERE status = 'active' AND image_url IS NOT NULL AND image_url <> ''`
    );

    for (const lostItem of lostItemsResult.rows) {
      const foundItemsResult = await query(
        `SELECT f.id, f.user_id, f.item_type, f.category, f.district, f.image_url, f.date_found, f.is_police_upload
         FROM found_items f
         WHERE f.category = $1 AND f.image_url = $2 AND f.status = 'active'`,
        [lostItem.category, lostItem.image_url]
      );

      for (const foundItem of foundItemsResult.rows) {
        const existingMatch = await query(
          'SELECT id FROM matches WHERE lost_item_id = $1 AND found_item_id = $2',
          [lostItem.id, foundItem.id]
        );

        if (existingMatch.rows.length) continue;

        const matchResult = await query(
          `INSERT INTO matches (lost_item_id, found_item_id, match_score, status)
           VALUES ($1, $2, $3, $4) RETURNING *`,
          [lostItem.id, foundItem.id, 100, 'pending']
        );

        const match = matchResult.rows[0];
        
        const lostUserResult = await query('SELECT * FROM users WHERE id = $1', [lostItem.user_id]);
        const foundUserResult = await query('SELECT * FROM users WHERE id = $1', [foundItem.user_id]);

        if (lostUserResult.rows.length && foundUserResult.rows.length) {
          const lostUser = lostUserResult.rows[0];
          const foundUser = foundUserResult.rows[0];

          await query(
            `INSERT INTO messages (sender_id, receiver_id, subject, message, match_id) VALUES ($1, $2, $3, $4, $5)`,
            [foundUser.id, lostUser.id, `Found: Your ${lostItem.item_type}`, `🎉 Great news! I found your item.`, match.id]
          );

          await query(
            `INSERT INTO messages (sender_id, receiver_id, subject, message, match_id) VALUES ($1, $2, $3, $4, $5)`,
            [lostUser.id, foundUser.id, `Re: Found my ${lostItem.item_type}`, `🙏 Thank you for finding my item!`, match.id]
          );
        }
      }
    }

    const matchedItemsResult = await query(
      `SELECT DISTINCT m.lost_item_id, m.found_item_id
       FROM matches m
       WHERE m.status IN ('pending', 'confirmed') AND m.match_score = 100`
    );

    for (const item of matchedItemsResult.rows) {
      await query('UPDATE lost_items SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', ['matched', item.lost_item_id]);
      await query('UPDATE found_items SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', ['matched', item.found_item_id]);
    }
  } catch (error) {
    console.error(error);
  }
};

const calculateMatchScore = async (lostItem, foundItem) => {
  let score = 0;
  if (lostItem.category === foundItem.category) {
    score += 40;
  } else {
    return 10; 
  }

  const lostHasImage = lostItem.image_url && lostItem.image_url.trim() !== '';
  const foundHasImage = foundItem.image_url && foundItem.image_url.trim() !== '';
  
  if (lostHasImage && foundHasImage) {
    const imageSimilarity = await analyzeImageSimilarity(lostItem.image_url, foundItem.image_url);
    score += (imageSimilarity / 100) * 40;
  } else if (lostHasImage || foundHasImage) {
    score += 10; 
  }

  if (lostItem.district === foundItem.district) score += 10;

  if (lostItem.item_type && foundItem.item_type) {
    const lostType = lostItem.item_type.toLowerCase();
    const foundType = foundItem.item_type.toLowerCase();
    if (lostType === foundType) score += 5;
    else if (lostType.includes(foundType) || foundType.includes(lostType)) score += 2;
  }

  if (lostItem.date_lost && foundItem.date_found) {
    const lostDate = new Date(lostItem.date_lost);
    const foundDate = new Date(foundItem.date_found);
    const daysDiff = Math.abs((foundDate - lostDate) / (1000 * 60 * 60 * 24));
    if (daysDiff <= 7) score += 5;
    else if (daysDiff <= 30) score += 2;
  }

  return Math.round(score);
};

const notifyMatch = async (match, lostItem, foundItem) => {
  try {
    const loserResult = await query('SELECT * FROM users WHERE id = $1', [lostItem.user_id]);
    const finderResult = await query('SELECT * FROM users WHERE id = $1', [foundItem.user_id]);

    const loser = loserResult.rows[0];
    const finder = finderResult.rows[0];

    await createNotification({
      userId: loser.id,
      type: 'MATCH_FOUND',
      title: 'Potential Match Found!',
      message: `Someone has found an item matching your lost ${lostItem.item_type}.`,
      relatedMatchId: match.id,
      relatedLostItemId: lostItem.id,
      relatedFoundItemId: foundItem.id
    });

    await createNotification({
      userId: finder.id,
      type: 'MATCH_FOUND',
      title: 'Match Found!',
      message: `Your found ${foundItem.item_type} matches a lost item report.`,
      relatedMatchId: match.id,
      relatedLostItemId: lostItem.id,
      relatedFoundItemId: foundItem.id
    });
  } catch (error) {
    console.error(error);
  }
};

export const getMatches = async (filters = {}) => {
  try {
    const { userId, userRole, status, limit = 50, offset = 0 } = filters;
    let whereConditions = [];
    let params = [];
    let paramCount = 1;

    if (status) {
      whereConditions.push(`m.status = $${paramCount++}`);
      params.push(status);
    }

    if (userId && userRole) {
      if (userRole === 'loser') {
        whereConditions.push(`l.user_id = $${paramCount++}`);
      } else if (userRole === 'finder' || userRole === 'police') {
        whereConditions.push(`f.user_id = $${paramCount++}`);
      }
      params.push(userId);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    params.push(limit, offset);

    const result = await query(
      `SELECT m.*, 
              l.item_type as lost_item_type, l.category as lost_category, l.district as lost_district, 
              l.reward_amount, l.user_id as loser_id,
              f.item_type as found_item_type, f.category as found_category, f.district as found_district,
              f.is_police_upload, f.user_id as finder_id,
              loser.full_name as loser_name, loser.phone_number as loser_phone, loser.email as loser_email,
              finder.full_name as finder_name, finder.phone_number as finder_phone, finder.email as finder_email
       FROM matches m
       JOIN lost_items l ON m.lost_item_id = l.id
       JOIN found_items f ON m.found_item_id = f.id
       JOIN users loser ON l.user_id = loser.id
       JOIN users finder ON f.user_id = finder.id
       ${whereClause}
       ORDER BY m.matched_at DESC
       LIMIT $${paramCount++} OFFSET $${paramCount}`,
      params
    );

    return result.rows;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateMatchStatus = async (matchId, status, userId, userRole, notes = null) => {
  try {
    const matchResult = await query(
      `SELECT m.*, l.user_id as loser_id, f.user_id as finder_id
       FROM matches m
       JOIN lost_items l ON m.lost_item_id = l.id
       JOIN found_items f ON m.found_item_id = f.id
       WHERE m.id = $1`,
      [matchId]
    );

    if (matchResult.rows.length === 0) throw new Error('Match not found');

    const match = matchResult.rows[0];
    const isLoser = match.loser_id === userId;
    const isFinder = match.finder_id === userId;
    const isAdmin = userRole === 'admin';

    if (!isLoser && !isFinder && !isAdmin) throw new Error('Unauthorized');

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (isLoser && status === 'confirmed') updates.push(`loser_confirmed = true`);
    if (isFinder && status === 'confirmed') updates.push(`finder_confirmed = true`);

    updates.push(`status = $${paramCount++}`);
    values.push(status);

    if (notes) {
      updates.push(`notes = $${paramCount++}`);
      values.push(notes);
    }

    if (status === 'completed') {
      updates.push(`resolved_at = CURRENT_TIMESTAMP`);
      await query('UPDATE lost_items SET status = $1 WHERE id = $2', ['resolved', match.lost_item_id]);
      await query('UPDATE found_items SET status = $1 WHERE id = $2', ['returned', match.found_item_id]);
    }

    values.push(matchId);

    const result = await query(
      `UPDATE matches SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    await logAudit({
      userId, action: 'MATCH_UPDATED', entityType: 'match', entityId: matchId, details: { status, notes }, ipAddress: null, userAgent: null
    });

    return result.rows[0];
  } catch (error) {
    console.error(error);
    throw error;
  }
};