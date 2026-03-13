import { query } from '../db/index.js'
import { notifyMatch } from '../notifications/notifyMatch.js'

export const checkForDuplicatesInSection = async (itemData, itemType) => {
  return null
}

export const calculateMatchScore = (lostItem, foundItem) => {
  let score = 0
  if (lostItem.category && foundItem.category && lostItem.category.toLowerCase() === foundItem.category.toLowerCase()) score += 40
  if (lostItem.district && foundItem.district && lostItem.district.toLowerCase() === foundItem.district.toLowerCase()) score += 30
  if (lostItem.item_type && foundItem.item_type && lostItem.item_type.toLowerCase() === foundItem.item_type.toLowerCase()) score += 20
  if (lostItem.date_lost && foundItem.date_found) {
    const lostDate = new Date(lostItem.date_lost)
    const foundDate = new Date(foundItem.date_found)
    if (Math.abs(lostDate - foundDate) <= 5 * 24 * 60 * 60 * 1000) score += 10
  }
  if (lostItem.additional_info && foundItem.additional_info) {
    const a = typeof lostItem.additional_info === 'string' ? JSON.parse(lostItem.additional_info) : lostItem.additional_info
    const b = typeof foundItem.additional_info === 'string' ? JSON.parse(foundItem.additional_info) : foundItem.additional_info
    if (a.color && b.color && a.color.toLowerCase() === b.color.toLowerCase()) score += 10
    if (a.contact_phone && b.contact_phone && a.contact_phone === b.contact_phone) score += 5
  }
  if (lostItem.image_url && foundItem.image_url && lostItem.image_url === foundItem.image_url) score = Math.max(score, 100)
  return score
}

const createStarterMatchMessage = async (match, lostUserId, foundUserId) => {
  await query(
    'INSERT INTO messages (sender_id, receiver_id, message, match_id) VALUES ($1, $2, $3, $4)',
    [lostUserId, foundUserId, 'A match was found for your item. You can now use the dashboard chat to communicate!', match.id]
  )
  await query(
    'INSERT INTO messages (sender_id, receiver_id, message, match_id) VALUES ($1, $2, $3, $4)',
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
      const foundItemsResult = await query('SELECT * FROM found_items WHERE category = $1 AND status = \'active\'', [lostItem.category])
      for (const foundItem of foundItemsResult.rows) {
        const matchScore = calculateMatchScore(lostItem, foundItem)
        if (matchScore >= 60) {
          const existingMatch = await query('SELECT id FROM matches WHERE lost_item_id = $1 AND found_item_id = $2', [lostItem.id, foundItem.id])
          if (existingMatch.rows.length === 0) {
            const matchResult = await query('INSERT INTO matches (lost_item_id, found_item_id, match_score, status) VALUES ($1, $2, $3, \'pending\') RETURNING *', [lostItem.id, foundItem.id, matchScore])
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
    } else if (itemType === 'found') {
      const foundItemResult = await query('SELECT * FROM found_items WHERE id = $1', [itemId])
      if (foundItemResult.rows.length === 0) return
      const foundItem = foundItemResult.rows[0]
      const lostItemsResult = await query('SELECT * FROM lost_items WHERE category = $1 AND status = \'active\'', [foundItem.category])
      for (const lostItem of lostItemsResult.rows) {
        const matchScore = calculateMatchScore(lostItem, foundItem)
        if (matchScore >= 60) {
          const existingMatch = await query('SELECT id FROM matches WHERE lost_item_id = $1 AND found_item_id = $2', [lostItem.id, foundItem.id])
          if (existingMatch.rows.length === 0) {
            const matchResult = await query('INSERT INTO matches (lost_item_id, found_item_id, match_score, status) VALUES ($1, $2, $3, \'pending\') RETURNING *', [lostItem.id, foundItem.id, matchScore])
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
  } catch (error) {}
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
          const matchResult = await query('INSERT INTO matches (lost_item_id, found_item_id, match_score, status) VALUES ($1, $2, $3, \'pending\') RETURNING *', [lostItem.id, foundItem.id, 100])
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
      `SELECT m.*, l.item_type as lost_item_type, l.category as lost_category, l.district as lost_district, l.reward_amount,
              l.user_id as loser_id, f.item_type as found_item_type, f.category as found_category, f.district as found_district,
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