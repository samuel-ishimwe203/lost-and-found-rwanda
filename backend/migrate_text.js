
import { query, connectDB } from './src/db/index.js';
import dotenv from 'dotenv';
dotenv.config();

async function migrate() {
  await connectDB();
  try {
    console.log('Adding text column to lost_items...');
    await query('ALTER TABLE lost_items ADD COLUMN IF NOT EXISTS text TEXT');
    
    console.log('Adding text column to found_items...');
    await query('ALTER TABLE found_items ADD COLUMN IF NOT EXISTS text TEXT');
    
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
