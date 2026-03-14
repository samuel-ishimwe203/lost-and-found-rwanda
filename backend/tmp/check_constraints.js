
import { query, connectDB } from '../src/db/index.js';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await connectDB();
  const res = await query(`
    SELECT conname, relname, pg_get_constraintdef(pg_constraint.oid) as def
    FROM pg_constraint 
    JOIN pg_class ON pg_class.oid = pg_constraint.conrelid
    JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
    WHERE nspname = 'public' AND contype = 'f'
    AND relname = 'notifications';
  `);
  res.rows.forEach(row => {
    console.log(`${row.relname}: ${row.conname} -> ${row.def}`);
  });
  process.exit();
}
run();
