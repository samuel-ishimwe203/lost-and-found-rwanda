import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { connectDB } from './src/db/index.js';
import { errorHandler, notFoundHandler } from './src/middleware/error.middleware.js';
import { scanExactDuplicates } from './src/services/matching.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import routes
import authRoutes from './src/routes/auth.routes.js';
import lostRoutes from './src/routes/lost.routes.js';
import foundRoutes from './src/routes/found.routes.js';
import matchRoutes from './src/routes/match.routes.js';
import notificationRoutes from './src/routes/notification.routes.js';
import messageRoutes from './src/routes/message.routes.js';
import adminRoutes from './src/routes/admin.routes.js';
import policeRoutes from './src/routes/police.routes.js';
import publicRoutes from './src/routes/public.routes.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration - Allow all origins for development
const corsOptions = {
  origin: true,
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Additional headers for file serving
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true,
    message: 'Lost & Found Rwanda API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/lost-items', lostRoutes);
app.use('/api/found-items', foundRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/police', policeRoutes);
app.use('/api/public', publicRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Connect to database and start server
const startServer = async () => {
  try {
    // Connect to PostgreSQL
    await connectDB();

    // On startup, perform a quick scan to auto-resolve exact duplicates
    // (same image URL + same category) and message both parties
    console.log('⏳ Initializing duplicate scan...');
    await scanExactDuplicates().catch(err => console.error('Startup duplicate scan failed:', err));

    // Periodic scan every 30 seconds to catch new matches
    setInterval(() => {
      console.log('🔄 Running periodic duplicate scan...');
      scanExactDuplicates().catch(err => console.error('Periodic scan failed:', err));
    }, 30000);

    // Start server
    app.listen(PORT, () => {
      console.log('');
      console.log('═══════════════════════════════════════════════════════');
      console.log('🚀 Lost & Found Rwanda API Server');
      console.log('═══════════════════════════════════════════════════════');
      console.log(`📡 Server running on port: ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
      console.log('═══════════════════════════════════════════════════════');
      console.log('');
      console.log('📚 API Endpoints:');
      console.log('   Authentication: /api/auth');
      console.log('   Lost Items: /api/lost-items');
      console.log('   Found Items: /api/found-items');
      console.log('   Matches: /api/matches');
      console.log('   Notifications: /api/notifications');
      console.log('   Admin: /api/admin');
      console.log('   Police: /api/police');
      console.log('   Public: /api/public');
      console.log('');
      console.log('💡 Ready to accept requests!');
      console.log('═══════════════════════════════════════════════════════');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

export default app;
