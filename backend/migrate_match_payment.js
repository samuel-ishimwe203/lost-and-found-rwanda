import { query, connectDB } from './src/db/index.js';
import dotenv from 'dotenv';
dotenv.config();

async function migrate() {
  try {
    await connectDB();
    
    console.log('Adding payment columns to matches table...');
    
    await query(`
      ALTER TABLE matches 
      ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
      ADD COLUMN IF NOT EXISTS payment_phone VARCHAR(50),
      ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(100),
      ADD COLUMN IF NOT EXISTS payment_name VARCHAR(100);
    `);
    
    console.log('Migration successful!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
