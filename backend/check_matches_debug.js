import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  try {
    const lost = await pool.query('SELECT id, status FROM lost_items WHERE id = 10');
    console.log('Lost:', lost.rows);
    const found = await pool.query('SELECT id, status FROM found_items WHERE id = 14');
    console.log('Found:', found.rows);
  } catch (error) {
    console.error(error);
  } finally {
    await pool.end();
  }
}
run();
