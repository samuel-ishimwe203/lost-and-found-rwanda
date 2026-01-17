# Lost & Found Rwanda - Backend API

Complete backend system for the Lost & Found Rwanda platform with PostgreSQL database, JWT authentication, role-based access control, matching algorithm, and multi-channel notifications.

## Features

✅ **User Management**
- Role-based registration (Loser/Finder)
- Admin and Police accounts (created by admins only)
- JWT authentication with secure password hashing
- Profile management and language preferences

✅ **Lost & Found Items**
- Post lost items with reward amounts
- Upload found items (finders and police)
- Police-verified uploads for trust
- Image support and detailed descriptions

✅ **Intelligent Matching**
- Automatic matching based on category, district, and item type
- Match scoring algorithm (60%+ threshold)
- Real-time match notifications

✅ **Multi-Channel Notifications**
- In-app notifications
- SMS (via Twilio)
- WhatsApp (via Twilio)
- Email (via NodeMailer)
- User notification preferences

✅ **Security & Auditing**
- Role-based access control (RBAC)
- Comprehensive audit logging
- Rate limiting and request validation
- Helmet.js security headers

## Technology Stack

- **Runtime**: Node.js with ES Modules
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Notifications**: Twilio (SMS/WhatsApp), NodeMailer (Email)
- **Security**: Helmet, CORS, Rate Limiting

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database (Neon account)
- Twilio account (for SMS/WhatsApp - optional)
- Email account (for email notifications - optional)

## Installation

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

Edit `.env` with your actual credentials:
```env
DATABASE_URL=postgresql://neondb_owner:npg_7FRD6PsEuGfw@ep-frosty-scene-aheg8fvk-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173

# Optional: Twilio for SMS/WhatsApp
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_phone_number
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Optional: Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

4. **Run database migrations**
```bash
npm run migrate
```

This will:
- Create all database tables
- Set up indexes for performance
- Create default admin account:
  - Email: `admin@lostandfound.rw`
  - Password: `Admin@2026`

5. **Start the server**

Development mode (with nodemon):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user (loser/finder)
- `POST /login` - Login user
- `POST /logout` - Logout user
- `GET /me` - Get current user
- `PUT /profile` - Update profile
- `PUT /change-password` - Change password

### Lost Items (`/api/lost-items`)
- `GET /` - Get all lost items (public)
- `GET /:id` - Get single lost item
- `POST /` - Post lost item (loser only)
- `GET /my/items` - Get my lost items
- `GET /my/stats` - Get dashboard statistics
- `PUT /:id` - Update lost item
- `DELETE /:id` - Delete lost item

### Found Items (`/api/found-items`)
- `GET /` - Get all found items (public)
- `GET /:id` - Get single found item
- `POST /` - Post found item (finder/police)
- `GET /my/items` - Get my found items
- `GET /my/stats` - Get dashboard statistics
- `PUT /:id` - Update found item
- `DELETE /:id` - Delete found item

### Matches (`/api/matches`)
- `GET /` - Get my matches
- `GET /:id` - Get single match
- `PUT /:id/confirm` - Confirm match
- `PUT /:id/reject` - Reject match
- `PUT /:id/complete` - Complete match

### Notifications (`/api/notifications`)
- `GET /` - Get notifications
- `GET /unread-count` - Get unread count
- `PUT /:id/read` - Mark as read
- `PUT /mark-all-read` - Mark all as read
- `DELETE /:id` - Delete notification

### Admin (`/api/admin`)
- `GET /users` - Get all users
- `POST /users` - Create police/admin account
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `GET /stats` - Get system statistics
- `GET /logs` - Get audit logs
- `GET /items` - Get all items
- `GET /matches` - Get all matches

### Police (`/api/police`)
- `POST /documents` - Post official document
- `GET /items` - Get police items
- `GET /claims` - Get claims
- `GET /returned-documents` - Get returned documents
- `GET /stats` - Get dashboard statistics

### Public (`/api/public`)
- `GET /items` - Get items (no auth)
- `GET /items/:type/:id` - Get item by ID
- `POST /search` - Search items
- `GET /stats` - Get public statistics

## Database Schema

### Users
- Roles: loser, finder, police, admin
- Authentication with bcrypt
- Language preferences (en, rw, fr, sw)
- Notification preferences

### Lost Items
- Category, district, description
- Reward amount
- Status tracking (active, matched, resolved, closed)

### Found Items
- Category, district, description
- Police upload flag
- Status tracking

### Matches
- Automatic matching with score
- Confirmation tracking
- Reward tracking

### Notifications
- Multi-channel support
- Delivery status tracking

### Audit Logs
- All user actions logged
- IP address and user agent tracking

## Role-Based Access Control

- **Loser**: Post lost items, view matches, manage own posts
- **Finder**: Upload found items, view matches, manage own uploads
- **Police**: Upload official documents, manage claims
- **Admin**: Full system access, user management, statistics

## Matching Algorithm

The system automatically matches lost and found items based on:
- Category match (40 points)
- District match (30 points)
- Item type similarity (20 points)
- Date proximity (10 points)

Minimum match score: 60%

## Notifications

When a match is found:
1. In-app notification (always)
2. SMS notification (if enabled)
3. WhatsApp message (if enabled)
4. Email notification (if enabled)

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based authorization
- Rate limiting (100 req/15min)
- Helmet.js security headers
- CORS protection
- SQL injection prevention (parameterized queries)
- Comprehensive audit logging

## Development

**File Structure**:
```
backend/
├── server.js                 # Main server file
├── package.json             # Dependencies
├── .env                     # Environment variables
├── src/
│   ├── controllers/         # Request handlers
│   ├── db/                  # Database connection
│   │   └── migrations/      # Database schema
│   ├── middleware/          # Auth, roles, errors
│   ├── routes/              # API routes
│   ├── services/            # Business logic
│   └── utils/               # Helper functions
```

## Troubleshooting

**Database connection error**:
- Verify DATABASE_URL is correct
- Check Neon database is active
- Ensure SSL mode is enabled

**JWT errors**:
- Verify JWT_SECRET is set
- Check token hasn't expired
- Ensure Bearer token format

**Notification failures**:
- Check Twilio credentials (SMS/WhatsApp)
- Verify email SMTP settings
- Review notification_preferences in database

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Configure CORS for production domain
4. Set up SSL/TLS certificates
5. Use process manager (PM2)
6. Enable database backups
7. Monitor logs and errors

## API Testing

Test health endpoint:
```bash
curl http://localhost:5000/health
```

Test registration:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123",
    "full_name": "Test User",
    "phone_number": "+250788000000",
    "role": "loser"
  }'
```

## Support

For issues or questions:
- Check logs: `console.log` statements in terminal
- Review audit logs via admin panel
- Check database constraints and foreign keys

## License

Proprietary - Lost & Found Rwanda Platform

---

**Default Admin Credentials** (Change immediately in production):
- Email: admin@lostandfound.rw
- Password: Admin@2026
