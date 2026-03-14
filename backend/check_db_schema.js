import { query, connectDB } from './src/db/index.js';
import dotenv from 'dotenv';
dotenv.config();

async function checkSchema() {
  try {
    await connectDB();
    const res = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'matches';
    `);
    console.log('Matches table columns:', JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

checkSchema();
