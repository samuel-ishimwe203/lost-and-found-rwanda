# Frontend to Backend Integration Guide

## Overview
This guide helps backend developers understand the frontend structure and requirements for seamless API integration.

---

## Frontend Architecture Overview

### Entry Point
- **App.jsx** - Main router with all routes defined
- **Routes**: 40+ routes across 5 dashboards

### Role-Based Routes

```
PUBLIC ROUTES:
  / → Home page
  /postings → All postings

AUTHENTICATED ROUTES:
  /lost-dashboard/* → Lost user features
  /found-dashboard/* → Found user features
  /admin-dashboard/* → Admin features
  /police-dashboard/* → Police features
```

---

## API Integration Requirements

### 1. Authentication Endpoints

**POST /api/auth/register**
```json
Request Body:
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string",
  "role": "lost_user|found_user",
  "phone": "string",
  "location": "string"
}

Response:
{
  "success": true,
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "role": "lost_user|found_user",
    "name": "string",
    "email": "string"
  }
}
```

**POST /api/auth/login**
```json
Request Body:
{
  "email": "string",
  "password": "string"
}

Response:
{
  "success": true,
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "role": "lost_user|found_user|admin|police",
    "name": "string",
    "email": "string"
  }
}
```

**POST /api/auth/logout**
```
Clears session/token
```

---

### 2. Lost Item Endpoints

**POST /api/lost-items**
```json
Request Body:
{
  "name": "string",
  "description": "string",
  "category": "string",
  "location": "string",
  "datePosted": "date",
  "reward": "number",
  "image": "file",
  "userId": "string"
}

Response:
{
  "success": true,
  "item": {
    "id": "item_id",
    "name": "string",
    "status": "active",
    "matchCount": 0
  }
}
```

**GET /api/lost-items**
```
Query Parameters:
  - category: string (optional)
  - location: string (optional)
  - status: string (optional)
  - page: number (optional)
  - limit: number (optional)

Response:
{
  "success": true,
  "items": [...],
  "total": number,
  "page": number
}
```

**GET /api/lost-items/:id**
```
Returns single item with full details
```

**PUT /api/lost-items/:id**
```
Update lost item details
```

**DELETE /api/lost-items/:id**
```
Delete lost item posting
```

**GET /api/lost-items/:id/matches**
```
Get potential matches for this lost item
```

---

### 3. Found Item Endpoints

**POST /api/found-items**
```json
Request Body:
{
  "name": "string",
  "description": "string",
  "category": "string",
  "location": "string",
  "dateFound": "date",
  "image": "file",
  "userId": "string"
}

Response:
{
  "success": true,
  "item": {
    "id": "item_id",
    "name": "string",
    "status": "pending",
    "matchCount": 0
  }
}
```

**GET /api/found-items**
```
Query Parameters: (same as lost items)
```

**PUT /api/found-items/:id**
```
Update found item details
```

**DELETE /api/found-items/:id**
```
Delete found item
```

**GET /api/found-items/:id/potential-matches**
```
Get potential matches with lost items
```

---

### 4. Matching Endpoints

**GET /api/matches/:foundItemId**
```json
Response:
{
  "success": true,
  "matches": [
    {
      "lostItemId": "id",
      "lostItemName": "string",
      "matchScore": 95,
      "similarity": "string"
    }
  ]
}
```

**POST /api/matches/confirm**
```json
Request Body:
{
  "foundItemId": "string",
  "lostItemId": "string",
  "status": "confirmed|rejected"
}
```

---

### 5. User Profile Endpoints

**GET /api/users/:id**
```
Get user profile details
```

**PUT /api/users/:id**
```json
Request Body:
{
  "firstName": "string",
  "lastName": "string",
  "phone": "string",
  "location": "string",
  "bio": "string"
}
```

**GET /api/users/:id/statistics**
```json
Response:
{
  "success": true,
  "stats": {
    "totalPostings": number,
    "activePostings": number,
    "matchedItems": number,
    "recoveredItems": number
  }
}
```

---

### 6. Message Endpoints

**GET /api/messages/:userId**
```
Get all messages for user
```

**POST /api/messages**
```json
Request Body:
{
  "senderId": "string",
  "receiverId": "string",
  "content": "string",
  "itemId": "string",
  "itemType": "lost|found"
}
```

**PUT /api/messages/:id/read**
```
Mark message as read
```

---

### 7. Police Endpoints

**POST /api/police-items**
```json
Request Body:
{
  "name": "string",
  "description": "string",
  "category": "string",
  "location": "string",
  "dateFound": "date",
  "image": "file",
  "officerName": "string",
  "badge": "string",
  "stationId": "string"
}
```

**GET /api/police-items**
```
List all police-uploaded items
```

**PUT /api/police-items/:id/claim-status**
```json
Request Body:
{
  "status": "pending|approved|rejected",
  "claimantId": "string"
}
```

---

### 8. Admin Endpoints

**GET /api/admin/dashboard**
```json
Response:
{
  "success": true,
  "stats": {
    "totalLostItems": number,
    "totalFoundItems": number,
    "matchedItems": number,
    "totalUsers": number,
    "recentActivity": []
  }
}
```

**POST /api/admin/police-accounts**
```json
Request Body:
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "badge": "string",
  "station": "string"
}
```

**GET /api/admin/items**
```
Get all items for management
```

**GET /api/admin/users**
```
Get all users
```

**PUT /api/admin/users/:id/status**
```json
Request Body:
{
  "status": "active|suspended|banned"
}
```

**GET /api/admin/logs**
```
Get activity logs
```

---

## Frontend Service Layer Updates

### services/api.js

```javascript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### services/auth.service.js

```javascript
import api from './api';

export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};
```

### Context Updates

**AuthContext.jsx** needs to:
1. Store JWT token
2. Store user role and info
3. Handle login/logout
4. Protect routes based on role

```javascript
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      setToken(response.data.token);
      setUser(response.data.user);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

## Data Models Expected from Backend

### User Model
```
{
  id: ObjectId,
  firstName: String,
  lastName: String,
  email: String,
  password: String (hashed),
  phone: String,
  location: String,
  role: Enum['lost_user', 'found_user', 'admin', 'police'],
  status: Enum['active', 'suspended', 'banned'],
  bio: String,
  verified: Boolean,
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### Lost Item Model
```
{
  id: ObjectId,
  name: String,
  description: String,
  category: String,
  location: String,
  datePosted: DateTime,
  dateLost: DateTime,
  reward: Number,
  image: String (URL),
  userId: ObjectId,
  status: Enum['active', 'pending', 'matched', 'recovered'],
  matches: [ObjectId],
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### Found Item Model
```
{
  id: ObjectId,
  name: String,
  description: String,
  category: String,
  location: String,
  dateFound: DateTime,
  image: String (URL),
  userId: ObjectId,
  status: Enum['pending', 'matched', 'returned', 'pending_claim'],
  potentialMatches: [ObjectId],
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### Message Model
```
{
  id: ObjectId,
  senderId: ObjectId,
  receiverId: ObjectId,
  content: String,
  itemId: ObjectId,
  itemType: Enum['lost', 'found'],
  isRead: Boolean,
  createdAt: DateTime
}
```

---

## Environment Variables

Create `.env` file in frontend:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
REACT_APP_VERSION=1.0.0
```

---

## Testing Checklist

- [ ] User can register with role selection
- [ ] User can login and get token
- [ ] Token is stored in localStorage
- [ ] User is redirected to correct dashboard
- [ ] Lost user can create posting
- [ ] Found user can upload item
- [ ] Matching algorithm works
- [ ] Messages send correctly
- [ ] Admin can manage users/items
- [ ] Police can upload official items
- [ ] All forms validate correctly
- [ ] Error messages display properly
- [ ] Language switching works
- [ ] Mobile responsive
- [ ] All routes protected correctly

---

## Common Issues & Solutions

### CORS Errors
- Enable CORS in backend
- Set correct headers
- Allow credentials in frontend requests

### Token Expiration
- Implement refresh token logic
- Store token expiry time
- Auto-logout when expired

### API Response Format
- Ensure consistent response structure
- Use `success: boolean` flag
- Include error messages
- Paginate large datasets

### File Uploads
- Handle multipart/form-data
- Validate file types
- Set file size limits
- Store in cloud storage (S3, etc.)

---

## Performance Optimization

- Implement pagination for lists
- Add loading indicators
- Cache frequently accessed data
- Debounce search inputs
- Lazy load images
- Minimize API calls
- Use request cancellation
- Implement error retry logic

---

## Security Considerations

- Validate all inputs
- Sanitize output
- Use HTTPS only
- Implement rate limiting
- Validate file uploads
- Use CSRF tokens
- Secure cookie settings
- Implement proper authorization

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] API URL correctly set
- [ ] Error tracking enabled
- [ ] Analytics setup
- [ ] Security headers set
- [ ] CORS configured
- [ ] Database backups working
- [ ] Monitoring setup
- [ ] Load balancing ready
- [ ] CDN configured for static files

---

## Support & Troubleshooting

For issues with:
1. **Frontend** - Check FRONTEND_COMPLETE_DOCUMENTATION.md
2. **API Integration** - Check this file
3. **Database** - Check backend documentation
4. **Deployment** - Check deployment guide

---

**This document should be kept updated as API endpoints are added or modified.**

Last Updated: January 16, 2026
