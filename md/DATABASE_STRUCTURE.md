# 🗄️ Database Structure - Lost & Found Rwanda

## Connection String
```
postgresql://neondb_owner:npg_7FRD6PsEuGfw@ep-frosty-scene-aheg8fvk-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
```

## 📊 All Tables (8 Tables Total)

### 1. **users** - User Accounts
Stores all user accounts (losers, finders, police, admin)

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PRIMARY KEY | Unique user ID |
| email | VARCHAR(255) UNIQUE | User email (must be unique) |
| password | VARCHAR(255) | Hashed password (bcrypt) |
| full_name | VARCHAR(255) | Full name |
| phone_number | VARCHAR(20) | Phone number |
| **role** | VARCHAR(20) | **'loser', 'finder', 'police', 'admin'** |
| language_preference | VARCHAR(10) | 'en', 'fr', 'rw', 'sw' |
| notification_preferences | JSONB | SMS, WhatsApp, Email, In-app settings |
| is_active | BOOLEAN | Account active status |
| created_by | INTEGER | Admin who created (for police/admin) |
| created_at | TIMESTAMP | Registration date |
| updated_at | TIMESTAMP | Last update |

**Indexes:** email, role

---

### 2. **police_profiles** - Police Officer Details ⭐ NEW
Stores additional information for police officers

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PRIMARY KEY | Profile ID |
| user_id | INTEGER UNIQUE | Links to users table |
| **badge_number** | VARCHAR(50) UNIQUE | Officer badge number |
| **rank** | VARCHAR(50) | Police rank (Constable, Sergeant, Inspector, etc.) |
| **police_station** | VARCHAR(255) | Station name |
| **district** | VARCHAR(100) | District where stationed |
| **department** | VARCHAR(100) | Department (CID, Traffic, etc.) |
| phone_official | VARCHAR(20) | Official phone number |
| email_official | VARCHAR(255) | Official email |
| assigned_cases | INTEGER | Number of cases assigned |
| is_verified | BOOLEAN | Verification status |
| verified_by | INTEGER | Admin who verified |
| verified_at | TIMESTAMP | Verification date |
| created_at | TIMESTAMP | Profile creation date |
| updated_at | TIMESTAMP | Last update |

**Indexes:** user_id, badge_number, police_station, district

---

### 3. **lost_items** - Lost Item Reports
Items reported as lost by users

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PRIMARY KEY | Item ID |
| user_id | INTEGER | User who reported |
| item_type | VARCHAR(100) | Type of item |
| category | VARCHAR(100) | Category |
| description | TEXT | Detailed description |
| location_lost | VARCHAR(255) | Where lost |
| district | VARCHAR(100) | District |
| date_lost | DATE | Date lost |
| reward_amount | DECIMAL(10,2) | Reward offered |
| status | VARCHAR(20) | 'active', 'matched', 'resolved', 'closed' |
| image_url | VARCHAR(500) | Item photo URL |
| additional_info | JSONB | Extra details |
| created_at | TIMESTAMP | Report date |
| updated_at | TIMESTAMP | Last update |

**Indexes:** user_id, status, district, category

---

### 4. **found_items** - Found Item Reports
Items reported as found by users or police

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PRIMARY KEY | Item ID |
| user_id | INTEGER | User/police who reported |
| item_type | VARCHAR(100) | Type of item |
| category | VARCHAR(100) | Category |
| description | TEXT | Detailed description |
| location_found | VARCHAR(255) | Where found |
| district | VARCHAR(100) | District |
| date_found | DATE | Date found |
| status | VARCHAR(20) | 'active', 'matched', 'returned', 'closed' |
| **is_police_upload** | BOOLEAN | True if uploaded by police |
| image_url | VARCHAR(500) | Item photo URL |
| additional_info | JSONB | Extra details |
| created_at | TIMESTAMP | Report date |
| updated_at | TIMESTAMP | Last update |

**Indexes:** user_id, status, district, category

---

### 5. **matches** - Automatic Matching Results
Stores matches between lost and found items

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PRIMARY KEY | Match ID |
| lost_item_id | INTEGER | Lost item reference |
| found_item_id | INTEGER | Found item reference |
| match_score | DECIMAL(5,2) | Match percentage (0-100) |
| status | VARCHAR(20) | 'pending', 'confirmed', 'rejected', 'completed' |
| loser_confirmed | BOOLEAN | Loser confirmation |
| finder_confirmed | BOOLEAN | Finder confirmation |
| reward_paid | BOOLEAN | Reward payment status |
| matched_at | TIMESTAMP | Match creation date |
| resolved_at | TIMESTAMP | Resolution date |
| notes | TEXT | Additional notes |

**Indexes:** lost_item_id, found_item_id

---

### 6. **notifications** - User Notifications
All notifications sent to users

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PRIMARY KEY | Notification ID |
| user_id | INTEGER | Recipient user |
| type | VARCHAR(50) | Notification type |
| title | VARCHAR(255) | Title |
| message | TEXT | Message content |
| channel | VARCHAR(20) | 'sms', 'whatsapp', 'email', 'in_app' |
| status | VARCHAR(20) | 'pending', 'sent', 'failed', 'read' |
| related_match_id | INTEGER | Related match |
| related_lost_item_id | INTEGER | Related lost item |
| related_found_item_id | INTEGER | Related found item |
| sent_at | TIMESTAMP | Send timestamp |
| read_at | TIMESTAMP | Read timestamp |
| error_message | TEXT | Error if failed |
| created_at | TIMESTAMP | Creation date |

**Indexes:** user_id

---

### 7. **audit_logs** - System Audit Trail
Tracks all important actions in the system

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PRIMARY KEY | Log ID |
| user_id | INTEGER | User who performed action |
| action | VARCHAR(100) | Action performed |
| entity_type | VARCHAR(50) | Type of entity |
| entity_id | INTEGER | Entity ID |
| details | JSONB | Additional details |
| ip_address | VARCHAR(50) | User's IP |
| user_agent | TEXT | Browser info |
| created_at | TIMESTAMP | Action timestamp |

---

### 8. **messages** - User Communication
Messages between users about matches

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PRIMARY KEY | Message ID |
| sender_id | INTEGER | Sender user |
| receiver_id | INTEGER | Receiver user |
| match_id | INTEGER | Related match |
| subject | VARCHAR(255) | Subject line |
| message | TEXT | Message content |
| is_read | BOOLEAN | Read status |
| created_at | TIMESTAMP | Send timestamp |

**Indexes:** sender_id, receiver_id

---

## 👮 How to Register Police Officers

### Step 1: Create User Account (Admin Only)
```sql
INSERT INTO users (email, password, full_name, phone_number, role, created_by)
VALUES (
  'officer@police.rw',
  '$2a$10$hashedpassword', -- Use bcrypt to hash password
  'Officer John Doe',
  '+250788123456',
  'police',
  1 -- Admin user ID
);
```

### Step 2: Create Police Profile
```sql
INSERT INTO police_profiles (
  user_id, 
  badge_number, 
  rank, 
  police_station, 
  district, 
  department,
  phone_official,
  email_official
) VALUES (
  2, -- The user_id from step 1
  'RNP-12345',
  'Inspector',
  'Remera Police Station',
  'Gasabo',
  'Criminal Investigation Department (CID)',
  '+250788999888',
  'john.doe@police.gov.rw'
);
```

### Step 3: Verify Officer (Admin Action)
```sql
UPDATE police_profiles 
SET is_verified = true, 
    verified_by = 1, -- Admin ID
    verified_at = CURRENT_TIMESTAMP 
WHERE user_id = 2;
```

---

## 📱 Police Capabilities

Police officers can:
- ✅ Upload found items (with `is_police_upload = true`)
- ✅ View all lost and found items
- ✅ Access full case details
- ✅ Communicate with losers and finders
- ✅ Generate reports
- ✅ Mark items as returned to owners
- ✅ Manage multiple cases

---

## 🔐 Default Admin Account

**Email:** admin@lostandfound.rw  
**Password:** Admin@2026  
**Role:** admin

The admin can:
- Create police accounts
- Verify police officers
- View all system data
- Manage users
- Access audit logs

---

## 📊 Total Statistics

- **Tables:** 8
- **Indexes:** 19 (for performance)
- **User Roles:** 4 (loser, finder, police, admin)
- **Item Categories:** Multiple (Documents, Electronics, Jewelry, etc.)
- **Notification Channels:** 4 (SMS, WhatsApp, Email, In-app)
- **Match Algorithm:** Automatic with 60% threshold

---

## 🚀 Quick Commands

### View all tables:
```bash
psql 'postgresql://neondb_owner:npg_7FRD6PsEuGfw@ep-frosty-scene-aheg8fvk-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require' -c "\dt"
```

### View police officers:
```sql
SELECT u.full_name, u.email, u.phone_number, 
       p.badge_number, p.rank, p.police_station, p.district
FROM users u
JOIN police_profiles p ON u.id = p.user_id
WHERE u.role = 'police';
```

### Count items by type:
```sql
SELECT 'Lost Items' as type, COUNT(*) FROM lost_items
UNION ALL
SELECT 'Found Items', COUNT(*) FROM found_items
UNION ALL
SELECT 'Matches', COUNT(*) FROM matches;
```

---

**System Ready!** All tables created and indexed for optimal performance! 🎉
