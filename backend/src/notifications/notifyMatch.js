import { query } from '../db/index.js';

export async function notifyMatch(match, lostItem, foundItem) {
  try {
    console.log('NOTIFY MATCH:', {
      matchId: match.id,
      lostItemId: lostItem.id,
      foundItemId: foundItem.id,
      message: `Match found for ${lostItem.item_type} between ${lostItem.id} and ${foundItem.id}`
    });

    // Create in-app notification for the loser (person who lost the item)
    await query(
      `INSERT INTO notifications (user_id, type, title, message, channel, status, related_match_id, related_lost_item_id, related_found_item_id, sent_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        lostItem.user_id,
        'match_found',
        '🎉 Match Found for Your Lost Item!',
        `Great news! Someone has found an item matching your lost ${lostItem.item_type || 'item'} (${lostItem.category || 'Unknown category'}). ` +
        `Go to your Dashboard > My Matches to view details and contact the finder.`,
        'in_app',
        'sent',
        match.id,
        lostItem.id,
        foundItem.id
      ]
    );

    // Create in-app notification for the finder (person who found the item)
    await query(
      `INSERT INTO notifications (user_id, type, title, message, channel, status, related_match_id, related_lost_item_id, related_found_item_id, sent_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        foundItem.user_id,
        'match_found',
        '🎉 Match Found for Your Found Item!',
        `Great news! Your found ${foundItem.item_type || 'item'} (${foundItem.category || 'Unknown category'}) matches a lost item report. ` +
        `Go to your Dashboard > Matches to view details and contact the owner.`,
        'in_app',
        'sent',
        match.id,
        lostItem.id,
        foundItem.id
      ]
    );

    console.log(`✅ In-app notifications created for both users (loser: ${lostItem.user_id}, finder: ${foundItem.user_id})`);
  } catch (error) {
    console.error('Error creating match notifications:', error);
    // Don't throw - notification failure shouldn't block matching
  }
}