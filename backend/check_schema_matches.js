import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const res = await pool.query(`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'matches'
    `);
    console.log(JSON.stringify(res.rows, null, 2));
  } catch(e) { console.error(e); }
  finally { await pool.end(); }
}
run();
