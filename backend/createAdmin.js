import bcrypt from 'bcryptjs';
import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function createAdmin() {
  try {
    const email = 'admin@lostandfound.rw';
    const password = 'AdminPassword123!';
    const fullName = 'System Administrator';
    const role = 'admin';

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Delete existing admin if there was a partial/broken insert
    await pool.query('DELETE FROM users WHERE email = $1', [email]);

    // Insert new admin, explicitly passing ALL required fields including timestamps
    await pool.query(
      `INSERT INTO users (
        email, 
        password, 
        full_name, 
        role, 
        is_active, 
        language_preference,
        created_at,
        updated_at
      ) 
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [email, hashedPassword, fullName, role, true, 'en']
    );

    console.log('✅ Admin account created successfully!');
    console.log('-----------------------------------');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('-----------------------------------');

    // Also create Police officer
    const policeEmail = 'police@lostandfound.rw';
    const policePassword = 'PolicePassword123!';
    const hashedPolicePass = await bcrypt.hash(policePassword, salt);
    
    await pool.query('DELETE FROM users WHERE email = $1', [policeEmail]);
    
    const policeResult = await pool.query(
      `INSERT INTO users (
        email, 
        password, 
        full_name, 
        role, 
        is_active, 
        language_preference,
        created_at,
        updated_at
      ) 
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id`,
      [policeEmail, hashedPolicePass, 'Officer Jean Claude', 'police', true, 'en']
    );
    
    const policeId = policeResult.rows[0].id;
    
    // Ensure police_profiles exists for them
    await pool.query(
      `INSERT INTO police_profiles (
        user_id, badge_number, police_station, district, verified_at, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT DO NOTHING`,
      [policeId, 'RNP-001', 'Remera Police Station', 'Gasabo']
    );

    console.log('✅ Police account created successfully!');
    console.log('-----------------------------------');
    console.log(`Email: ${policeEmail}`);
    console.log(`Password: ${policePassword}`);
    console.log('-----------------------------------');

  } catch (error) {
    console.error('Error creating accounts:', error.message);
  } finally {
    await pool.end();
  }
}

createAdmin();