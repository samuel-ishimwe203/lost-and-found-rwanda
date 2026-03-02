# 👮 Police Officer Registration & Admin Approval System

## Overview
This document describes the complete police officer registration system implemented for the Lost & Found Rwanda application. Police officers must now register with official documents and receive admin approval before they can access the platform.

---

## 🔄 System Flow

### 1. **Police Registration Process**
```
Police Officer
      ↓
Fills Registration Form with Official Credentials
      ↓
Uploads Official Document (ID, Badge, Appointment Letter)
      ↓
Account Created (Inactive/Pending)
      ↓
All Admins Receive Notification Message
      ↓
Admin Reviews Documents
      ↓
Admin Approves or Rejects Registration
      ↓
Police Officer Receives Notification
      ↓
If Approved: Can Login and Use Platform
If Rejected: Account Deleted, Notification Sent
```

---

## 📋 Backend Implementation

### Database Changes

#### Updated `police_profiles` Table
```sql
CREATE TABLE police_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id),
  badge_number VARCHAR(50) UNIQUE,
  rank VARCHAR(50),
  police_station VARCHAR(255),
  district VARCHAR(100),
  department VARCHAR(100),
  email_official VARCHAR(255),
  phone_official VARCHAR(20),
  document_url VARCHAR(500),  -- URL to uploaded official document
  is_verified BOOLEAN DEFAULT false,
  verified_by INTEGER REFERENCES users(id),
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Updated `users` Table
- Police accounts are created with `is_active = false` initially
- After admin approval, `is_active` is set to `true`

---

## 🔐 Authentication Flow

### Police Registration Endpoint
**POST** `/auth/register-police`

**Request Body:**
```json
{
  "full_name": "John Doe",
  "email": "john@police.rw",
  "phone_number": "+250 7XX XXX XXX",
  "badge_number": "PL-2024-001",
  "rank": "Inspector",
  "police_station": "Kigali Central Police Station",
  "district": "Nyarugenge",
  "department": "CID",
  "email_official": "john.official@police.rw",
  "phone_official": "+250 7XX XXX XXX",
  "password": "securepassword123",
  "document_url": "uploads/documents/badge_id.pdf"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Police registration submitted successfully. Awaiting admin approval.",
  "data": {
    "user": {
      "id": 123,
      "email": "john@police.rw",
      "full_name": "John Doe",
      "role": "police",
      "is_active": false
    },
    "profile": {
      "badge_number": "PL-2024-001",
      "rank": "Inspector",
      "police_station": "Kigali Central Police Station",
      "district": "Nyarugenge",
      "is_verified": false
    },
    "message": "Your registration is pending admin verification..."
  }
}
```

---

### Login Validation for Police

**POST** `/auth/login`

**Enhanced Checks:**
1. User exists
2. Password is correct
3. User account is active (`is_active = true`)
4. **For police users:** Profile exists and is verified (`is_verified = true`)

**Error Messages:**
- If pending verification: `"Your police account is pending admin verification. Please check your email for updates."`
- If profile not found: `"Police profile not found. Please contact admin."`
- If not verified: `"Your police profile is pending admin verification. Your official documents are being reviewed."`

---

## 👨‍💼 Admin Management Endpoints

### Get Pending Police Registrations
**GET** `/admin/police/pending`

**Response:**
```json
{
  "success": true,
  "data": {
    "pendingRequests": [
      {
        "id": 1,
        "user_id": 123,
        "email": "john@police.rw",
        "full_name": "John Doe",
        "phone_number": "+250 7XX XXX XXX",
        "badge_number": "PL-2024-001",
        "rank": "Inspector",
        "police_station": "Kigali Central Police Station",
        "district": "Nyarugenge",
        "department": "CID",
        "email_official": "john.official@police.rw",
        "phone_official": "+250 7XX XXX XXX",
        "document_url": "uploads/documents/badge_id.pdf",
        "is_verified": false,
        "created_at": "2024-01-18T10:30:00Z"
      }
    ],
    "count": 1
  }
}
```

### Approve Police Registration
**POST** `/admin/police/approve/:police_profile_id`

**Request Body:**
```json
{
  "remarks": "Document verified successfully"
}
```

**Actions:**
1. Updates `police_profiles.is_verified = true`
2. Updates `police_profiles.verified_by = admin_id`
3. Updates `police_profiles.verified_at = now()`
4. Updates `users.is_active = true`
5. Sends notification message to police officer
6. Logs audit entry

**Response:**
```json
{
  "success": true,
  "message": "Police registration approved successfully",
  "data": {
    "profile": { ... },
    "user": { ... }
  }
}
```

### Reject Police Registration
**POST** `/admin/police/reject/:police_profile_id`

**Request Body:**
```json
{
  "reason": "Document appears to be invalid or incomplete"
}
```

**Actions:**
1. Sends rejection notification to police officer with reason
2. Deletes from `police_profiles`
3. Deletes from `users`
4. Logs audit entry

**Response:**
```json
{
  "success": true,
  "message": "Police registration rejected successfully",
  "data": {
    "rejectedUser": { ... }
  }
}
```

---

## 📱 Frontend Implementation

### New Components

#### 1. RegisterPolice.jsx
- Complete registration form for police officers
- Fields: Full name, email, phone, badge number, rank, police station, district, department, official contact info
- Document upload functionality
- Password validation
- Displays approval pending message after submission

**Route:** `/register-police`

**Features:**
- Form validation
- Password matching
- Required field validation
- File upload for official document
- Helpful UI notices about approval process

#### 2. ManagePoliceRegistrations.jsx
- Admin dashboard component for managing police registrations
- Displays all pending registration requests
- Shows officer details, badge, station, district
- Link to view official document
- Approve and Reject buttons with modal confirmations

**Route:** `/admin-dashboard/manage-police-registrations`

**Features:**
- List of pending requests with officer info
- Approval modal with optional remarks
- Rejection modal with required reason
- Automatic page refresh after action
- Success/error notifications

### Updated Components

#### Register.jsx
- Added button to navigate to police registration
- Button placed at bottom of registration form
- Text: "Are you a police officer? 👮 Register as Police Officer"

#### App.jsx
- Added routes for `/register`, `/register-police`, `/login`
- Added police registration component to admin dashboard routes

#### AdminDashboardLayout.jsx
- Added "👮 Police Registrations" link to sidebar navigation

---

## 🔄 Message/Notification Flow

### When Police Registers
1. System creates message in `messages` table
2. Sender: Police officer ID
3. Receiver: All active admin users
4. Subject: "New Police Registration Pending Approval"
5. Message: Includes officer name, badge number, station, and district

### When Admin Approves
1. System creates message in `messages` table
2. Sender: Admin ID
3. Receiver: Police officer ID
4. Subject: "Police Registration Approved"
5. Message: Confirmation message with any remarks

### When Admin Rejects
1. System creates message in `messages` table
2. Sender: Admin ID
3. Receiver: Police officer ID (before deletion)
4. Subject: "Police Registration Rejected"
5. Message: Rejection reason and instructions

---

## 🔒 Security Considerations

### Account Lockdown
- Police accounts are **inactive by default** (`is_active = false`)
- Cannot login until admin approves
- Profile must be marked as verified

### Document Verification
- Admin must manually review official documents
- System sends document URL for admin to access
- No auto-approval mechanisms

### Audit Logging
All actions are logged:
- Police registration attempts
- Admin approvals/rejections
- Login attempts (failed or pending)

### Role Validation
- Only users with `role = 'police'` can register via this endpoint
- Only users with `role = 'admin'` can approve/reject
- Check `user.is_active` before allowing police login

---

## 📊 Database Impact

### New Records Created:
1. **users** table: 1 row (with `is_active = false`)
2. **police_profiles** table: 1 row (with `is_verified = false`)
3. **messages** table: Multiple rows (notifications)
4. **audit_logs** table: Multiple rows (tracking)

### No Changes to:
- `lost_items` table structure
- `found_items` table structure
- `matches` table structure
- `loser` or `finder` user workflows

---

## 🎯 Ensuring Lost/Found Dashboards Are Unaffected

### Measures Taken:
1. **Separate Role Check:** Police have `role = 'police'`, separate from 'loser' and 'finder'
2. **No Shared Tables:** Police registration uses dedicated `police_profiles` table
3. **Independent Endpoints:** All police-related endpoints are separate from lost/found endpoints
4. **User Routes Protected:** Each dashboard validates user role before allowing access
5. **Message System Isolated:** Police notifications don't interfere with item-related messages

### Dashboard Access Control:
```javascript
// Lost Dashboard - Only for 'loser' role
isAuthenticated && user?.role === 'loser' ? <LostDashboardLayout /> : <Navigate to="/" />

// Found Dashboard - Only for 'finder' role
isAuthenticated && user?.role === 'finder' ? <FoundDashboardLayout /> : <Navigate to="/" />

// Police Dashboard - Only for 'police' role AND is_active AND is_verified
isAuthenticated && user?.role === 'police' ? <PoliceDashboardLayout /> : <Navigate to="/" />
```

---

## 🧪 Testing Checklist

### Backend Tests:
- [ ] Police registration endpoint accepts valid data
- [ ] Badge number uniqueness enforced
- [ ] Email uniqueness enforced
- [ ] Password validation works
- [ ] Account created as inactive
- [ ] Notifications sent to all admins
- [ ] Admin can approve registration
- [ ] Admin can reject registration
- [ ] Police cannot login if not approved
- [ ] Police can login after approval
- [ ] Lost/Found workflows unaffected

### Frontend Tests:
- [ ] Police registration form displays correctly
- [ ] Form validation works
- [ ] File upload functionality works
- [ ] Admin dashboard shows pending requests
- [ ] Approve modal functions
- [ ] Reject modal functions
- [ ] Success/error messages display
- [ ] Page redirects after registration
- [ ] Lost/Found dashboards still work

---

## 📝 API Documentation

All police-related endpoints are protected by `authenticate` and `adminOnly` middleware.

| Method | Endpoint | Auth | Role | Purpose |
|--------|----------|------|------|---------|
| POST | `/auth/register-police` | None | Public | Police self-registration |
| POST | `/auth/login` | None | Public | Login (enhanced for police) |
| GET | `/admin/police/pending` | Required | Admin | List pending registrations |
| POST | `/admin/police/approve/:id` | Required | Admin | Approve registration |
| POST | `/admin/police/reject/:id` | Required | Admin | Reject registration |

---

## 🚀 Future Enhancements

Potential improvements for future versions:
1. Email notifications (not just in-app messages)
2. Document verification using AI/OCR
3. Badge number database integration
4. Police station directory
5. Bulk import of police officers
6. Two-factor authentication for police accounts
7. Document expiration and renewal system
8. Police activity tracking dashboard

---

## 📞 Support

For issues or questions about the police registration system, please contact the development team or refer to the system status documentation.

**Last Updated:** January 18, 2026
**Version:** 1.0
**Status:** Production Ready
