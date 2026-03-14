import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const lost = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'lost_items'`);
    console.log('Lost columns:', lost.rows.map(r => r.column_name));
    const found = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'found_items'`);
    console.log('Found columns:', found.rows.map(r => r.column_name));
  } catch(e) { console.error(e); }
  finally { await pool.end(); }
}
run();
