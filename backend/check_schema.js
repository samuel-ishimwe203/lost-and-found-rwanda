
import { query } from './src/db/index.js';
import dotenv from 'dotenv';
dotenv.config();

async function checkSchema() {
  await import('./src/db/index.js').then(m => m.connectDB());
  try {
    console.log('Checking lost_items columns...');
    const lostColumns = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'lost_items'
    `);
    console.log('lost_items:', lostColumns.rows.map(r => r.column_name).join(', '));

    console.log('Checking found_items columns...');
    const foundColumns = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'found_items'
    `);
    console.log('found_items:', foundColumns.rows.map(r => r.column_name).join(', '));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkSchema();
