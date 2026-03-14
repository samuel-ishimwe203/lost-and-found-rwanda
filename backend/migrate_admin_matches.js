import { query, connectDB } from './src/db/index.js';
import dotenv from 'dotenv';
dotenv.config();

async function migrate() {
  try {
    await connectDB();
    
    console.log('Adding admin control columns to matches table...');
    
    await query(`
      ALTER TABLE matches 
      ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS is_unlocked BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS admin_fee NUMERIC DEFAULT 0,
      ADD COLUMN IF NOT EXISTS admin_feedback TEXT;
    `);
    
    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit();
  }
}

migrate();
