import dotenv from 'dotenv';
import { connectDB, query } from './index.js';

dotenv.config();

const fixDatabase = async () => {
  try {
    console.log('🔧 Checking and fixing database schema...');

    // Add document_url column to police_profiles if it doesn't exist
    await query(`
      ALTER TABLE police_profiles 
      ADD COLUMN IF NOT EXISTS document_url VARCHAR(500)
    `);
    console.log('✅ document_url column added to police_profiles (if it was missing)');

    // Ensure messages table has created_at column
    await query(`
      ALTER TABLE messages 
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);
    console.log('✅ created_at column added to messages (if it was missing)');

    console.log('✅ Database schema fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing database:', error);
    process.exit(1);
  }
};

// Run fix
connectDB().then(() => {
  fixDatabase();
});
