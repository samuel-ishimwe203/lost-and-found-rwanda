import { query } from '../db/index.js'
import { notifyMatch } from '../notifications/notifyMatch.js'

export const checkForDuplicatesInSection = async (itemData, itemType) => {
  return null
}

const getKeywords = (text) => {
  if (!text) return [];
  // Remove special chars, lowercase, split by whitespace, filter out short words
  return text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3);
};

export const calculateMatchScore = (lostItem, foundItem) => {
  let score = 0;
  
  // 1. HARD IDENTIFIER MATCHING (Highest Priority)
  if (lostItem.id_number && foundItem.id_number) {
    if (lostItem.id_number === foundItem.id_number) return 100;
  }

  // 2. OCR RAW TEXT SIMILARITY (Keyword Overlap)
  // This is the "Professional" part - comparing extracted text from both images
  const lostKeywords = getKeywords(lostItem.text);
  const foundKeywords = getKeywords(foundItem.text);
  
  if (lostKeywords.length > 0 && foundKeywords.length > 0) {
    const overlap = lostKeywords.filter(word => foundKeywords.includes(word));
    // Calculate percentage overlap relative to the lost item (the search target)
    const similarity = (overlap.length / lostKeywords.length) * 100;
    
    // If we have strong keyword overlap (e.g. names, specific ID snippets)
    if (similarity > 50) score += 70;
    else if (similarity > 20) score += 30;
  }

  // 3. HOLDER NAME CROSS-CHECK
  if (lostItem.holder_name) {
    const hn = lostItem.holder_name.toLowerCase();
    if (foundItem.holder_name && foundItem.holder_name.toLowerCase() === hn) {
      score += 50;
    } else if (foundItem.text && foundItem.text.toLowerCase().includes(hn)) {
      score += 40;
    }
  }

  // 4. SECONDARY ATTRIBUTES (Only as tie-breakers or boosters)
  // Category match is now a booster, not a trigger (lowered from 60 to 15)
  if (lostItem.category && foundItem.category && 
      lostItem.category.toLowerCase() === foundItem.category.toLowerCase() && 
      lostItem.category.toLowerCase() !== 'other') {
    score += 15;
  }

  if (lostItem.district && foundItem.district && 
      lostItem.district.toLowerCase() === foundItem.district.toLowerCase()) {
    score += 10;
  }

  if (lostItem.date_lost && foundItem.date_found) {
    const lostDate = new Date(lostItem.date_lost);
    const foundDate = new Date(foundItem.date_found);
    if (Math.abs(lostDate - foundDate) <= 7 * 24 * 60 * 60 * 1000) {
      score += 5;
    }
  }

  // EXACT IMAGE URL MATCH (Fraud check/duplicate check)
  if (lostItem.image_url && foundItem.image_url && lostItem.image_url === foundItem.image_url) {
    return 100;
  }

  // Final validation: Professional matches MUST have some text evidence or 
  // extremely high attribute overlap to be considered.
  // We cap the score at 100.
  return Math.min(score, 100);
};

const createStarterMatchMessage = async (match, lostUserId, foundUserId) => {
  await query(
    'INSERT INTO messages (sender_id, receiver_id, message, match_id, created_at, updated_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
    [lostUserId, foundUserId, 'A match was found for your item. You can now use the dashboard chat to communicate!', match.id]
  )
  await query(
    'INSERT INTO messages (sender_id, receiver_id, message, match_id, created_at, updated_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
    [foundUserId, lostUserId, 'A match was found for your item. You can now use the dashboard chat to communicate!', match.id]
  )
}

export const checkForMatches = async (itemId, itemType) => {
  const matches = []
  try {
    if (itemType === 'lost') {
      const lostItemResult = await query('SELECT * FROM lost_items WHERE id = $1', [itemId])
      if (lostItemResult.rows.length === 0) return
      const lostItem = lostItemResult.rows[0]

      // Pass 1: Category-based matching (existing logic)
      const foundItemsResult = await query('SELECT * FROM found_items WHERE category = $1 AND status = \'active\'', [lostItem.category])
      for (const foundItem of foundItemsResult.rows) {
        const matchScore = calculateMatchScore(lostItem, foundItem)
        if (matchScore >= 50) {
          const existingMatch = await query('SELECT id FROM matches WHERE lost_item_id = $1 AND found_item_id = $2', [lostItem.id, foundItem.id])
          if (existingMatch.rows.length === 0) {
            const matchResult = await query('INSERT INTO matches (lost_item_id, found_item_id, match_score, status, created_at, updated_at, matched_at) VALUES ($1, $2, $3, \'pending\', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *', [lostItem.id, foundItem.id, matchScore])
            const match = matchResult.rows[0]
            const lostUpdate = await query('UPDATE lost_items SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING status', ['matched', lostItem.id])
            const foundUpdate = await query('UPDATE found_items SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING status', ['matched', foundItem.id])
            console.log('DEBUG: Updated lost item', lostItem.id, 'status:', lostUpdate.rows[0]?.status)
            console.log('DEBUG: Updated found item', foundItem.id, 'status:', foundUpdate.rows[0]?.status)
            await notifyMatch(match, lostItem, foundItem)
            await createStarterMatchMessage(match, lostItem.user_id, foundItem.user_id)
            matches.push(match)
          }
        }
      }

      // Pass 2: OCR text-based cross-match (ID number or holder name across ALL found items)
      if (lostItem.id_number || lostItem.holder_name) {
        let ocrSql = `SELECT * FROM found_items WHERE status = 'active' AND (`
        const ocrParams = []
        let conditions = []
        
        if (lostItem.id_number) {
          ocrParams.push(lostItem.id_number)
          conditions.push(`id_number = $${ocrParams.length} OR text ILIKE '%' || $${ocrParams.length} || '%'`)
        }
        
        if (lostItem.holder_name) {
          ocrParams.push(lostItem.holder_name.toLowerCase())
          conditions.push(`LOWER(holder_name) = $${ocrParams.length} OR text ILIKE '%' || $${ocrParams.length} || '%'`)
        }
        
        ocrSql += conditions.join(' OR ') + `)`
        
        const ocrFoundResult = await query(ocrSql, ocrParams)
        for (const foundItem of ocrFoundResult.rows) {
          const existingMatch = await query('SELECT id FROM matches WHERE lost_item_id = $1 AND found_item_id = $2', [lostItem.id, foundItem.id])
          if (existingMatch.rows.length === 0) {
            const matchScore = calculateMatchScore(lostItem, foundItem)
            const matchResult = await query('INSERT INTO matches (lost_item_id, found_item_id, match_score, status, created_at, updated_at, matched_at) VALUES ($1, $2, $3, \'pending\', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *', [lostItem.id, foundItem.id, Math.max(matchScore, 80)])
            const match = matchResult.rows[0]
            await query('UPDATE lost_items SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', ['matched', lostItem.id])
            await query('UPDATE found_items SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', ['matched', foundItem.id])
            await notifyMatch(match, lostItem, foundItem)
            await createStarterMatchMessage(match, lostItem.user_id, foundItem.user_id)
            matches.push(match)
          }
        }
      }

    } else if (itemType === 'found') {
      const foundItemResult = await query('SELECT * FROM found_items WHERE id = $1', [itemId])
      if (foundItemResult.rows.length === 0) return
      const foundItem = foundItemResult.rows[0]

      // Pass 1: Category-based matching (existing logic)
      const lostItemsResult = await query('SELECT * FROM lost_items WHERE category = $1 AND status = \'active\'', [foundItem.category])
      for (const lostItem of lostItemsResult.rows) {
        const matchScore = calculateMatchScore(lostItem, foundItem)
        if (matchScore >= 50) {
          const existingMatch = await query('SELECT id FROM matches WHERE lost_item_id = $1 AND found_item_id = $2', [lostItem.id, foundItem.id])
          if (existingMatch.rows.length === 0) {
            const matchResult = await query('INSERT INTO matches (lost_item_id, found_item_id, match_score, status, created_at, updated_at, matched_at) VALUES ($1, $2, $3, \'pending\', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *', [lostItem.id, foundItem.id, matchScore])
            const match = matchResult.rows[0]
            await query('UPDATE lost_items SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', ['matched', lostItem.id])
            await query('UPDATE found_items SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', ['matched', foundItem.id])
            await notifyMatch(match, lostItem, foundItem)
            await createStarterMatchMessage(match, lostItem.user_id, foundItem.user_id)
            matches.push(match)
          }
        }
      }

      // Pass 2: OCR text-based cross-match (ID number or holder name across ALL lost items)
      if (foundItem.id_number || foundItem.holder_name) {
        let ocrSql = `SELECT * FROM lost_items WHERE status = 'active' AND (`
        const ocrParams = []
        let conditions = []
        
        if (foundItem.id_number) {
          ocrParams.push(foundItem.id_number)
          conditions.push(`id_number = $${ocrParams.length} OR text ILIKE '%' || $${ocrParams.length} || '%'`)
        }
        
        if (foundItem.holder_name) {
          ocrParams.push(foundItem.holder_name.toLowerCase())
          conditions.push(`LOWER(holder_name) = $${ocrParams.length} OR text ILIKE '%' || $${ocrParams.length} || '%'`)
        }
        
        ocrSql += conditions.join(' OR ') + `)`
        
        const ocrLostResult = await query(ocrSql, ocrParams)
        for (const lostItem of ocrLostResult.rows) {
          const existingMatch = await query('SELECT id FROM matches WHERE lost_item_id = $1 AND found_item_id = $2', [lostItem.id, foundItem.id])
          if (existingMatch.rows.length === 0) {
            const matchScore = calculateMatchScore(lostItem, foundItem)
            const matchResult = await query('INSERT INTO matches (lost_item_id, found_item_id, match_score, status, created_at, updated_at, matched_at) VALUES ($1, $2, $3, \'pending\', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *', [lostItem.id, foundItem.id, Math.max(matchScore, 80)])
            const match = matchResult.rows[0]
            await query('UPDATE lost_items SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', ['matched', lostItem.id])
            await query('UPDATE found_items SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', ['matched', foundItem.id])
            await notifyMatch(match, lostItem, foundItem)
            await createStarterMatchMessage(match, lostItem.user_id, foundItem.user_id)
            matches.push(match)
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in checkForMatches:', error);
  }
  return matches
}

export const scanExactDuplicates = async () => {
  try {
    const lostItemsResult = await query('SELECT * FROM lost_items WHERE status = \'active\' AND image_url IS NOT NULL AND image_url <> \'\'')
    for (const lostItem of lostItemsResult.rows) {
      const foundItemsResult = await query('SELECT * FROM found_items WHERE category = $1 AND status = \'active\' AND image_url = $2', [lostItem.category, lostItem.image_url])
      for (const foundItem of foundItemsResult.rows) {
        const existingMatch = await query('SELECT id FROM matches WHERE lost_item_id = $1 AND found_item_id = $2', [lostItem.id, foundItem.id])
        if (existingMatch.rows.length === 0) {
          const matchResult = await query('INSERT INTO matches (lost_item_id, found_item_id, match_score, status, created_at, updated_at, matched_at) VALUES ($1, $2, $3, \'pending\', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *', [lostItem.id, foundItem.id, 100])
          const match = matchResult.rows[0]
          await query('UPDATE lost_items SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', ['matched', lostItem.id])
          await query('UPDATE found_items SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', ['matched', foundItem.id])
          await notifyMatch(match, lostItem, foundItem)
          await createStarterMatchMessage(match, lostItem.user_id, foundItem.user_id)
        }
      }
    }
  } catch (error) {}
}

export const getMatches = async (filters = {}) => {
  try {
    const { userId, userRole, status, limit = 50, offset = 0 } = filters
    console.log('GET MATCHES FILTERS:', { userId, userRole, status, limit, offset });
    let where = []
    let params = []
    let count = 1
    if (status) {
      where.push(`m.status = $${count++}`)
      params.push(status)
    }
    if (userId && userRole) {
      if (userRole === 'loser') {
        where.push(`l.user_id = $${count++}`)
        params.push(userId)
      }
      if (userRole === 'finder' || userRole === 'police') {
        where.push(`f.user_id = $${count++}`)
        params.push(userId)
      }
    }
    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : ''
    params.push(limit, offset)
    const result = await query(
      `SELECT m.*, 
              l.item_type as lost_item_type, l.category as lost_category, l.district as lost_district, 
              l.reward_amount, l.image_url as lost_image_url, l.text as lost_text, 
              l.additional_info as lost_additional_info, l.date_lost, l.user_id as loser_id,
              f.item_type as found_item_type, f.category as found_category, f.district as found_district,
              f.image_url as found_image_url, f.text as found_text, f.additional_info as found_additional_info,
              f.date_found, f.is_police_upload, f.user_id as finder_id,
              loser.full_name as loser_name, loser.phone_number as loser_phone, loser.email as loser_email,
              finder.full_name as finder_name, finder.phone_number as finder_phone, finder.email as finder_email
       FROM matches m
       JOIN lost_items l ON m.lost_item_id = l.id
       JOIN found_items f ON m.found_item_id = f.id
       JOIN users loser ON l.user_id = loser.id
       JOIN users finder ON f.user_id = finder.id
       ${whereClause}
       ORDER BY m.match_score DESC, m.matched_at DESC
       LIMIT $${count++} OFFSET $${count}`,
      params
    )
    return result.rows
  } catch (error) {
    return []
  }
}

export const updateMatchStatus = async (matchId, status, userId, userRole, notes = null) => {
  try {
    const matchResult = await query(
      `SELECT m.*, l.user_id as loser_id, f.user_id as finder_id
       FROM matches m
       JOIN lost_items l ON m.lost_item_id = l.id
       JOIN found_items f ON m.found_item_id = f.id
       WHERE m.id = $1`,
      [matchId]
    )
    if (matchResult.rows.length === 0) throw new Error('Match not found')
    const match = matchResult.rows[0]
    const isLoser = match.loser_id === userId
    const isFinder = match.finder_id === userId
    const isAdmin = userRole === 'admin'
    if (!isLoser && !isFinder && !isAdmin) throw new Error('Unauthorized')
    const updates = []
    const values = []
    let count = 1
    if (isLoser && status === 'confirmed') updates.push(`loser_confirmed = true`)
    if (isFinder && status === 'confirmed') updates.push(`finder_confirmed = true`)
    updates.push(`status = $${count++}`)
    values.push(status)
    if (notes) {
      updates.push(`notes = $${count++}`)
      values.push(notes)
    }
    if (status === 'completed') {
      updates.push(`resolved_at = CURRENT_TIMESTAMP`)
      await query('UPDATE lost_items SET status = $1 WHERE id = $2', ['resolved', match.lost_item_id])
      await query('UPDATE found_items SET status = $1 WHERE id = $2', ['returned', match.found_item_id])
    }
    values.push(matchId)
    const result = await query(
      `UPDATE matches SET ${updates.join(', ')} WHERE id = $${count} RETURNING *`,
      values
    )
    return result.rows[0]
  } catch (error) {
    return null
  }
}