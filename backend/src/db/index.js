import pg from 'pg';
const { Pool } = pg;

let pool;

export const connectDB = async () => {
  try {
    // Parse the DATABASE_URL to handle Neon's connection string
    const connectionString = process.env.DATABASE_URL;
    
    pool = new Pool({
      connectionString: connectionString,
      ssl: connectionString.includes('neon.tech') ? {
        rejectUnauthorized: false
      } : false,
      // Connection pool configuration to prevent disconnections
      max: 20, // Maximum pool size
      min: 2, // Minimum pool size
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 10000, // Return error after 10 seconds if connection not available
      maxUses: 7500, // Close connection after 7500 uses
      allowExitOnIdle: false, // Keep the pool alive even if idle
      // Neon specific settings
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
    });

    // Handle pool errors
    pool.on('error', (err, client) => {
      console.error('❌ Unexpected error on idle client', err);
    });

    pool.on('connect', (client) => {
      console.log('🔌 New client connected to database');
    });

    pool.on('remove', (client) => {
      console.log('🔌 Client removed from pool');
    });

    // Test the connection with retry logic
    let retries = 3;
    let connected = false;
    
    while (retries > 0 && !connected) {
      try {
        const client = await pool.connect();
        console.log('✅ PostgreSQL connected successfully');
        client.release();
        connected = true;
      } catch (err) {
        retries--;
        if (retries > 0) {
          console.log(`⚠️ Connection failed, retrying... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
        } else {
          throw err;
        }
      }
    }
    
    return pool;
  } catch (error) {
    console.error('❌ PostgreSQL connection error:', error);
    process.exit(1);
  }
};

export const getPool = () => {
  if (!pool) {
    throw new Error('Database pool not initialized. Call connectDB first.');
  }
  return pool;
};

export const query = async (text, params) => {
  const start = Date.now();
  
  // Check if pool is initialized
  if (!pool) {
    throw new Error('Database pool not initialized. Call connectDB first.');
  }
  
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Query error:', error);
    
    // If connection error, try to reconnect
    if (error.code === 'ECONNRESET' || error.code === 'ECONNREFUSED') {
      console.log('⚠️ Connection lost, attempting to reconnect...');
      try {
        await connectDB();
        // Retry the query once after reconnection
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('✅ Query retried successfully after reconnection', { text, duration, rows: res.rowCount });
        return res;
      } catch (retryError) {
        console.error('❌ Query failed even after reconnection:', retryError);
        throw retryError;
      }
    }
    
    throw error;
  }
};
