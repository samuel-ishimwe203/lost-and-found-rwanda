import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

export const calculateMatchScore = (lostItem, foundItem) => {
  if (lostItem.id_number && foundItem.id_number && lostItem.id_number === foundItem.id_number) return 100;
  let score = 0;
  if (lostItem.holder_name && foundItem.holder_name &&
      lostItem.holder_name.toLowerCase() === foundItem.holder_name.toLowerCase()) score += 60;
  if (lostItem.category && foundItem.category && lostItem.category.toLowerCase() === foundItem.category.toLowerCase() && lostItem.category.toLowerCase() !== 'other') score += 60;
  if (lostItem.district && foundItem.district && lostItem.district.toLowerCase() === foundItem.district.toLowerCase()) score += 20;
  if (lostItem.item_type && foundItem.item_type && lostItem.item_type.toLowerCase() === foundItem.item_type.toLowerCase()) score += 10;
  if (lostItem.image_url && foundItem.image_url && lostItem.image_url === foundItem.image_url) score = Math.max(score, 100);
  return score;
}

async function run() {
  try {
    const lostItemResult = await pool.query('SELECT * FROM lost_items WHERE id = 10');
    const lostItem = lostItemResult.rows[0];
    console.log('Lost item:', lostItem.id, lostItem.category);
    const foundItemsResult = await pool.query('SELECT * FROM found_items WHERE category = $1 AND status = \'active\'', [lostItem.category]);
    console.log('Found items count:', foundItemsResult.rows.length);
    for (const foundItem of foundItemsResult.rows) {
      const matchScore = calculateMatchScore(lostItem, foundItem);
      console.log('Score against found item', foundItem.id, 'is', matchScore);
      if (matchScore >= 50) {
        const existingMatch = await pool.query('SELECT id FROM matches WHERE lost_item_id = $1 AND found_item_id = $2', [lostItem.id, foundItem.id]);
        console.log('Existing match?', existingMatch.rows);
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    pool.end();
  }
}
run();
