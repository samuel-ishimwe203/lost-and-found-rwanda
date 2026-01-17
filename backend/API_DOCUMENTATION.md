# Lost & Found Rwanda - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require authentication via JWT token. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 1. Authentication Endpoints

### Register User
**POST** `/api/auth/register`

Register a new user (loser or finder role only).

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "full_name": "John Doe",
  "phone_number": "+250788123456",
  "role": "loser",
  "language_preference": "en"
}
```

**Roles:** `loser` or `finder` only (police and admin created by admin)

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "full_name": "John Doe",
      "phone_number": "+250788123456",
      "role": "loser",
      "language_preference": "en"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login
**POST** `/api/auth/login`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "loser",
      ...
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Get Current User
**GET** `/api/auth/me`
**Auth Required:** Yes

### Update Profile
**PUT** `/api/auth/profile`
**Auth Required:** Yes

**Body:**
```json
{
  "full_name": "Jane Doe",
  "phone_number": "+250788999888",
  "language_preference": "rw",
  "notification_preferences": {
    "sms": true,
    "whatsapp": false,
    "email": true,
    "in_app": true
  }
}
```

### Change Password
**PUT** `/api/auth/change-password`
**Auth Required:** Yes

**Body:**
```json
{
  "current_password": "OldPass123",
  "new_password": "NewPass456"
}
```

---

## 2. Lost Items Endpoints

### Post Lost Item
**POST** `/api/lost-items`
**Auth Required:** Yes (Loser role only)

**Body:**
```json
{
  "item_type": "National ID",
  "category": "Documents",
  "description": "Lost national ID card near bus station",
  "location_lost": "Remera Bus Station",
  "district": "Gasabo",
  "date_lost": "2026-01-15",
  "reward_amount": 5000,
  "image_url": "https://example.com/image.jpg",
  "additional_info": {
    "color": "blue",
    "brand": "Government issued"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Lost item posted successfully",
  "data": {
    "lostItem": {
      "id": 1,
      "user_id": 1,
      "item_type": "National ID",
      "category": "Documents",
      "district": "Gasabo",
      "reward_amount": 5000,
      "status": "active",
      "created_at": "2026-01-16T10:30:00.000Z",
      ...
    }
  }
}
```

### Get All Lost Items
**GET** `/api/lost-items`
**Auth Required:** No (Public)

**Query Parameters:**
- `status` - Filter by status (active, matched, resolved, closed)
- `district` - Filter by district
- `category` - Filter by category
- `search` - Search in item_type and description
- `limit` - Results per page (default: 50)
- `offset` - Pagination offset

**Response (200):**
```json
{
  "success": true,
  "data": {
    "lostItems": [...],
    "total": 150,
    "limit": 50,
    "offset": 0
  }
}
```

### Get Single Lost Item
**GET** `/api/lost-items/:id`

### Get My Lost Items
**GET** `/api/lost-items/my/items`
**Auth Required:** Yes (Loser only)

### Get Dashboard Statistics
**GET** `/api/lost-items/my/stats`
**Auth Required:** Yes (Loser only)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalLostItems": 10,
    "activePostings": 5,
    "matchedItems": 3,
    "pendingMatches": 2,
    "resolvedItems": 2,
    "totalRewardOffered": 50000
  }
}
```

### Update Lost Item
**PUT** `/api/lost-items/:id`
**Auth Required:** Yes (Owner or Admin)

### Delete Lost Item
**DELETE** `/api/lost-items/:id`
**Auth Required:** Yes (Owner or Admin)

---

## 3. Found Items Endpoints

### Post Found Item
**POST** `/api/found-items`
**Auth Required:** Yes (Finder or Police role)

**Body:**
```json
{
  "item_type": "National ID",
  "category": "Documents",
  "description": "Found national ID card at bus station",
  "location_found": "Remera Bus Station",
  "district": "Gasabo",
  "date_found": "2026-01-16",
  "image_url": "https://example.com/image.jpg"
}
```

### Get All Found Items
**GET** `/api/found-items`
**Auth Required:** No (Public)

**Query Parameters:**
- `status`, `district`, `category`, `search`, `limit`, `offset`
- `is_police_upload` - Filter police uploads (true/false)

### Get My Found Items
**GET** `/api/found-items/my/items`
**Auth Required:** Yes

### Get Dashboard Statistics
**GET** `/api/found-items/my/stats`
**Auth Required:** Yes (Finder only)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalFoundItems": 8,
    "activeItems": 3,
    "matchedItems": 4,
    "returnedItems": 1,
    "totalRewardsEarned": 15000
  }
}
```

---

## 4. Matches Endpoints

### Get My Matches
**GET** `/api/matches`
**Auth Required:** Yes

**Query Parameters:**
- `status` - Filter by status (pending, confirmed, rejected, completed)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "matches": [
      {
        "id": 1,
        "lost_item_id": 5,
        "found_item_id": 3,
        "match_score": 85.50,
        "status": "pending",
        "loser_confirmed": false,
        "finder_confirmed": false,
        "reward_amount": 5000,
        "loser_name": "John Doe",
        "finder_name": "Jane Smith",
        "is_police_upload": false,
        "matched_at": "2026-01-16T11:00:00.000Z"
      }
    ]
  }
}
```

### Get Single Match
**GET** `/api/matches/:id`
**Auth Required:** Yes

### Confirm Match
**PUT** `/api/matches/:id/confirm`
**Auth Required:** Yes (Loser or Finder)

**Body:**
```json
{
  "notes": "Confirmed, item matches perfectly"
}
```

### Reject Match
**PUT** `/api/matches/:id/reject`
**Auth Required:** Yes (Loser or Finder)

**Body:**
```json
{
  "notes": "Item doesn't match my description"
}
```

### Complete Match
**PUT** `/api/matches/:id/complete`
**Auth Required:** Yes (Loser or Finder)

**Body:**
```json
{
  "notes": "Item successfully returned",
  "reward_paid": true
}
```

---

## 5. Notifications Endpoints

### Get Notifications
**GET** `/api/notifications`
**Auth Required:** Yes

**Query Parameters:**
- `status` - Filter by status (pending, sent, failed, read)
- `channel` - Filter by channel (sms, whatsapp, email, in_app)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": 1,
        "user_id": 1,
        "type": "MATCH_FOUND",
        "title": "Potential Match Found!",
        "message": "Someone has found an item matching your lost National ID",
        "channel": "in_app",
        "status": "sent",
        "related_match_id": 5,
        "created_at": "2026-01-16T11:05:00.000Z"
      }
    ],
    "unreadCount": 3
  }
}
```

### Get Unread Count
**GET** `/api/notifications/unread-count`
**Auth Required:** Yes

### Mark as Read
**PUT** `/api/notifications/:id/read`
**Auth Required:** Yes

### Mark All as Read
**PUT** `/api/notifications/mark-all-read`
**Auth Required:** Yes

### Delete Notification
**DELETE** `/api/notifications/:id`
**Auth Required:** Yes

---

## 6. Admin Endpoints

**All admin endpoints require Admin role**

### Get All Users
**GET** `/api/admin/users`
**Auth Required:** Yes (Admin only)

**Query Parameters:**
- `role` - Filter by role (loser, finder, police, admin)
- `is_active` - Filter by active status (true/false)
- `search` - Search by name or email

### Create Official Account
**POST** `/api/admin/users`
**Auth Required:** Yes (Admin only)

**Body:**
```json
{
  "email": "police@lostandfound.rw",
  "password": "Police@123",
  "full_name": "Police Officer Name",
  "phone_number": "+250788111222",
  "role": "police"
}
```

**Roles:** `police` or `admin` only

### Update User
**PUT** `/api/admin/users/:id`
**Auth Required:** Yes (Admin only)

**Body:**
```json
{
  "is_active": false,
  "role": "admin"
}
```

### Delete User
**DELETE** `/api/admin/users/:id`
**Auth Required:** Yes (Admin only)

### Get System Statistics
**GET** `/api/admin/stats`
**Auth Required:** Yes (Admin only)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 150,
      "losers": 80,
      "finders": 60,
      "police": 8,
      "admins": 2
    },
    "lostItems": {
      "total": 200,
      "active": 120,
      "matched": 50,
      "resolved": 30
    },
    "foundItems": {
      "total": 180,
      "active": 100,
      "policeUploads": 45
    },
    "matches": {
      "total": 75,
      "pending": 20,
      "confirmed": 30,
      "completed": 25
    },
    "rewards": {
      "totalOffered": 500000,
      "totalPaid": 250000
    }
  }
}
```

### Get Audit Logs
**GET** `/api/admin/logs`
**Auth Required:** Yes (Admin only)

**Query Parameters:**
- `userId`, `action`, `entityType`, `startDate`, `endDate`, `limit`

### Get All Items
**GET** `/api/admin/items`
**Auth Required:** Yes (Admin only)

### Get All Matches
**GET** `/api/admin/matches`
**Auth Required:** Yes (Admin only)

---

## 7. Police Endpoints

**All police endpoints require Police role**

### Post Official Document
**POST** `/api/police/documents`
**Auth Required:** Yes (Police only)

**Body:** Same as posting found item, but automatically marked as `is_police_upload: true`

### Get Police Items
**GET** `/api/police/items`
**Auth Required:** Yes (Police only)

### Manage Claims
**GET** `/api/police/claims`
**Auth Required:** Yes (Police only)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "claims": [
      {
        "match_id": 1,
        "found_item_type": "National ID",
        "lost_item_type": "National ID",
        "reward_amount": 5000,
        "claimer_name": "John Doe",
        "claimer_phone": "+250788123456",
        "status": "pending",
        "matched_at": "2026-01-16T10:00:00.000Z"
      }
    ]
  }
}
```

### Get Returned Documents
**GET** `/api/police/returned-documents`
**Auth Required:** Yes (Police only)

### Get Dashboard Statistics
**GET** `/api/police/stats`
**Auth Required:** Yes (Police only)

---

## 8. Public Endpoints

**No authentication required**

### Get Public Items
**GET** `/api/public/items`

**Query Parameters:**
- `type` - Filter by type (lost, found, all)
- `district`, `category`, `search`, `limit`, `offset`

### Get Item by ID
**GET** `/api/public/items/:type/:id`

**Example:** `/api/public/items/lost/5`

### Search Items
**POST** `/api/public/search`

**Body:**
```json
{
  "district": "Gasabo",
  "category": "Documents",
  "item_type": "National ID",
  "date_from": "2026-01-01",
  "date_to": "2026-01-16"
}
```

### Get Public Statistics
**GET** `/api/public/stats`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "activeLostItems": 120,
    "activeFoundItems": 100,
    "successfulMatches": 25,
    "totalRewardsPaid": 250000
  }
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (no token or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

---

## Testing the API

### Using cURL

**Register:**
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

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123"
  }'
```

**Post Lost Item (with token):**
```bash
curl -X POST http://localhost:5000/api/lost-items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "item_type": "National ID",
    "category": "Documents",
    "description": "Lost national ID",
    "location_lost": "Remera",
    "district": "Gasabo",
    "reward_amount": 5000
  }'
```

---

## Default Admin Account

**Email:** admin@lostandfound.rw  
**Password:** Admin@2026

**⚠️ Change this password immediately in production!**
