import dotenv from 'dotenv';
import { connectDB, query } from '../index.js';

dotenv.config();

const createTables = async () => {
  try {
    console.log('🔄 Starting database migrations...');

    // Users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        phone_number VARCHAR(20),
        role VARCHAR(20) NOT NULL CHECK (role IN ('loser', 'finder', 'police', 'admin')),
        language_preference VARCHAR(10) DEFAULT 'en',
        notification_preferences JSONB DEFAULT '{"sms": true, "whatsapp": true, "email": true, "in_app": true}',
        is_active BOOLEAN DEFAULT true,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');

    // Lost items table
    await query(`
      CREATE TABLE IF NOT EXISTS lost_items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        item_type VARCHAR(100) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT,
        location_lost VARCHAR(255) NOT NULL,
        district VARCHAR(100) NOT NULL,
        date_lost DATE,
        reward_amount DECIMAL(10, 2) DEFAULT 0,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'matched', 'resolved', 'closed')),
        image_url VARCHAR(500),
        additional_info JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Lost items table created');

    // Found items table
    await query(`
      CREATE TABLE IF NOT EXISTS found_items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        item_type VARCHAR(100) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT,
        location_found VARCHAR(255) NOT NULL,
        district VARCHAR(100) NOT NULL,
        date_found DATE,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'matched', 'returned', 'closed')),
        is_police_upload BOOLEAN DEFAULT false,
        image_url VARCHAR(500),
        additional_info JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Found items table created');

    // Matches table
    await query(`
      CREATE TABLE IF NOT EXISTS matches (
        id SERIAL PRIMARY KEY,
        lost_item_id INTEGER NOT NULL REFERENCES lost_items(id) ON DELETE CASCADE,
        found_item_id INTEGER NOT NULL REFERENCES found_items(id) ON DELETE CASCADE,
        match_score DECIMAL(5, 2) DEFAULT 0,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'completed')),
        loser_confirmed BOOLEAN DEFAULT false,
        finder_confirmed BOOLEAN DEFAULT false,
        reward_paid BOOLEAN DEFAULT false,
        matched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP,
        notes TEXT,
        UNIQUE(lost_item_id, found_item_id)
      )
    `);
    console.log('✅ Matches table created');

    // Notifications table
    await query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        channel VARCHAR(20) NOT NULL CHECK (channel IN ('sms', 'whatsapp', 'email', 'in_app')),
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'read')),
        related_match_id INTEGER REFERENCES matches(id),
        related_lost_item_id INTEGER REFERENCES lost_items(id),
        related_found_item_id INTEGER REFERENCES found_items(id),
        sent_at TIMESTAMP,
        read_at TIMESTAMP,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Notifications table created');

    // Audit logs table
    await query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id INTEGER,
        details JSONB,
        ip_address VARCHAR(50),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Audit logs table created');

    // Messages table (for user communication)
    await query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        match_id INTEGER REFERENCES matches(id),
        subject VARCHAR(255),
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Messages table created');

    // Police profiles table (for police-specific data)
    await query(`
      CREATE TABLE IF NOT EXISTS police_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        badge_number VARCHAR(50) UNIQUE NOT NULL,
        rank VARCHAR(50),
        police_station VARCHAR(255) NOT NULL,
        district VARCHAR(100) NOT NULL,
        department VARCHAR(100),
        phone_official VARCHAR(20),
        email_official VARCHAR(255),
        assigned_cases INTEGER DEFAULT 0,
        is_verified BOOLEAN DEFAULT false,
        verified_by INTEGER REFERENCES users(id),
        verified_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Police profiles table created');

    // Create indexes for better performance
    await query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await query('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)');
    await query('CREATE INDEX IF NOT EXISTS idx_lost_items_user ON lost_items(user_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_lost_items_status ON lost_items(status)');
    await query('CREATE INDEX IF NOT EXISTS idx_lost_items_district ON lost_items(district)');
    await query('CREATE INDEX IF NOT EXISTS idx_lost_items_category ON lost_items(category)');
    await query('CREATE INDEX IF NOT EXISTS idx_found_items_user ON found_items(user_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_found_items_status ON found_items(status)');
    await query('CREATE INDEX IF NOT EXISTS idx_found_items_district ON found_items(district)');
    await query('CREATE INDEX IF NOT EXISTS idx_found_items_category ON found_items(category)');
    await query('CREATE INDEX IF NOT EXISTS idx_matches_lost_item ON matches(lost_item_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_matches_found_item ON matches(found_item_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_police_profiles_user ON police_profiles(user_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_police_profiles_badge ON police_profiles(badge_number)');
    await query('CREATE INDEX IF NOT EXISTS idx_police_profiles_station ON police_profiles(police_station)');
    await query('CREATE INDEX IF NOT EXISTS idx_police_profiles_district ON police_profiles(district)');
    console.log('✅ Indexes created');

    // Create default admin user
    const adminCheck = await query("SELECT * FROM users WHERE email = 'admin@lostandfound.rw'");
    if (adminCheck.rows.length === 0) {
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.default.hash('Admin@2026', 10);
      await query(
        `INSERT INTO users (email, password, full_name, phone_number, role, is_active) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        ['admin@lostandfound.rw', hashedPassword, 'System Administrator', '+250788000000', 'admin', true]
      );
      console.log('✅ Default admin user created');
      console.log('📧 Admin email: admin@lostandfound.rw');
      console.log('🔑 Admin password: Admin@2026');
    }

    // Create default police officer
    const policeCheck = await query("SELECT * FROM users WHERE email = 'police@lostandfound.rw'");
    if (policeCheck.rows.length === 0) {
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.default.hash('Police@2026', 10);
      const policeResult = await query(
        `INSERT INTO users (email, password, full_name, phone_number, role, is_active, created_by) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        ['police@lostandfound.rw', hashedPassword, 'Officer Jean Claude', '+250788111111', 'police', true, 1]
      );
      
      const policeUserId = policeResult.rows[0].id;
      
      // Create police profile
      await query(
        `INSERT INTO police_profiles (user_id, badge_number, rank, police_station, district, department, phone_official, email_official, is_verified, verified_by, verified_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)`,
        [policeUserId, 'RNP-001', 'Inspector', 'Remera Police Station', 'Gasabo', 'Criminal Investigation Department', '+250788111111', 'police@lostandfound.rw', true, 1]
      );
      
      console.log('✅ Default police officer created');
      console.log('📧 Police email: police@lostandfound.rw');
      console.log('🔑 Police password: Police@2026');
      console.log('🎖️  Badge: RNP-001 | Rank: Inspector | Station: Remera Police Station');
    }

    console.log('✅ All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
};

// Run migrations
connectDB().then(() => {
  createTables();
});
