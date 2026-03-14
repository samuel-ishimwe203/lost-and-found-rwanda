import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const userId = 33;
  const userRole = 'loser';
  const limit = 50;
  const offset = 0;

  try {
    let where = [];
    let params = [];
    let count = 1;
    
    if (userId && userRole) {
      if (userRole === 'loser') {
        where.push(`l.user_id = $${count++}`);
        params.push(userId);
      }
      if (userRole === 'finder' || userRole === 'police') {
        where.push(`f.user_id = $${count++}`);
        params.push(userId);
      }
    }
    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    params.push(limit, offset);
    
    const query = `
      SELECT m.*, 
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
       LIMIT $${count++} OFFSET $${count}
    `;
    
    console.log('SQL:', query);
    console.log('Params:', params);
    
    const res = await pool.query(query, params);
    console.log('Results:', res.rows.length);
    console.log(JSON.stringify(res.rows, null, 2));

  } catch (error) {
    console.error(error);
  } finally {
    pool.end();
  }
}
run();
