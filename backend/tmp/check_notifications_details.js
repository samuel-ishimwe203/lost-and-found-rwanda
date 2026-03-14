
import { query, connectDB } from '../src/db/index.js';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await connectDB();
  const res = await query(`
    SELECT column_name, is_nullable, column_default 
    FROM information_schema.columns 
    WHERE table_name = 'notifications';
  `);
  console.log(JSON.stringify(res.rows, null, 2));
  process.exit();
}
run();
