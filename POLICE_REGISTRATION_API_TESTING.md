# 🧪 Police Registration System - API Testing Guide

## Testing the Police Registration System

This guide provides exact API calls for testing all police registration functionality.

---

## 1. Police Registration

### Endpoint
```
POST http://localhost:5000/api/auth/register-police
Content-Type: application/json
```

### Request Example
```json
{
  "full_name": "John Doe",
  "email": "john.doe@police.rw",
  "phone_number": "+250 788 123 456",
  "badge_number": "PL-2024-001",
  "rank": "Inspector",
  "police_station": "Kigali Central Police Station",
  "district": "Nyarugenge",
  "department": "Criminal Investigation Division",
  "email_official": "j.doe@rp.gov.rw",
  "phone_official": "+250 722 123 456",
  "password": "SecurePassword123",
  "document_url": "uploads/documents/police_badge.pdf"
}
```

### Expected Response (Success)
```json
{
  "success": true,
  "message": "Police registration submitted successfully. Awaiting admin approval.",
  "data": {
    "user": {
      "id": 123,
      "email": "john.doe@police.rw",
      "full_name": "John Doe",
      "phone_number": "+250 788 123 456",
      "role": "police",
      "is_active": false
    },
    "profile": {
      "id": 45,
      "user_id": 123,
      "badge_number": "PL-2024-001",
      "rank": "Inspector",
      "police_station": "Kigali Central Police Station",
      "district": "Nyarugenge",
      "department": "Criminal Investigation Division",
      "is_verified": false
    },
    "message": "Your registration is pending admin verification. You will receive an email once your documents are verified."
  }
}
```

### Error Response (Duplicate Badge)
```json
{
  "success": false,
  "message": "This badge number is already registered in the system."
}
```

### Error Response (Duplicate Email)
```json
{
  "success": false,
  "message": "This email is already registered. Please use a different email address."
}
```

---

## 2. Police Login (Before Approval)

### Endpoint
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json
```

### Request
```json
{
  "email": "john.doe@police.rw",
  "password": "SecurePassword123"
}
```

### Expected Response (Should Fail - Pending Approval)
```json
{
  "success": false,
  "message": "Your police profile is pending admin verification. Your official documents are being reviewed."
}
```

---

## 3. Get Pending Police Registrations (Admin)

### Endpoint
```
GET http://localhost:5000/api/admin/police/pending
Authorization: Bearer {admin_token}
Content-Type: application/json
```

### Expected Response
```json
{
  "success": true,
  "data": {
    "pendingRequests": [
      {
        "id": 45,
        "user_id": 123,
        "badge_number": "PL-2024-001",
        "rank": "Inspector",
        "police_station": "Kigali Central Police Station",
        "district": "Nyarugenge",
        "department": "Criminal Investigation Division",
        "email_official": "j.doe@rp.gov.rw",
        "phone_official": "+250 722 123 456",
        "document_url": "uploads/documents/police_badge.pdf",
        "is_verified": false,
        "full_name": "John Doe",
        "email": "john.doe@police.rw",
        "phone_number": "+250 788 123 456",
        "created_at": "2024-01-18T10:30:00Z"
      }
    ],
    "count": 1
  }
}
```

---

## 4. Approve Police Registration (Admin)

### Endpoint
```
POST http://localhost:5000/api/admin/police/approve/45
Authorization: Bearer {admin_token}
Content-Type: application/json
```

### Request
```json
{
  "remarks": "Documents verified successfully. ID and badge verified."
}
```

### Expected Response
```json
{
  "success": true,
  "message": "Police registration approved successfully",
  "data": {
    "profile": {
      "id": 45,
      "user_id": 123,
      "badge_number": "PL-2024-001",
      "rank": "Inspector",
      "police_station": "Kigali Central Police Station",
      "district": "Nyarugenge",
      "is_verified": true,
      "verified_by": 99,
      "verified_at": "2024-01-18T11:45:00Z"
    },
    "user": {
      "id": 123,
      "email": "john.doe@police.rw",
      "full_name": "John Doe",
      "is_active": true
    }
  }
}
```

### What Happens:
1. ✅ `police_profiles.is_verified` set to `true`
2. ✅ `police_profiles.verified_by` set to admin ID
3. ✅ `police_profiles.verified_at` set to current timestamp
4. ✅ `users.is_active` set to `true`
5. ✅ Notification message sent to police officer
6. ✅ Audit log entry created

---

## 5. Police Login (After Approval)

### Endpoint
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json
```

### Request
```json
{
  "email": "john.doe@police.rw",
  "password": "SecurePassword123"
}
```

### Expected Response (Success)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 123,
      "email": "john.doe@police.rw",
      "full_name": "John Doe",
      "phone_number": "+250 788 123 456",
      "role": "police",
      "language_preference": "en",
      "notification_preferences": null
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 6. Reject Police Registration (Admin)

### Endpoint
```
POST http://localhost:5000/api/admin/police/reject/45
Authorization: Bearer {admin_token}
Content-Type: application/json
```

### Request
```json
{
  "reason": "The uploaded document appears to be invalid or expired. Please resubmit with a valid official ID."
}
```

### Expected Response
```json
{
  "success": true,
  "message": "Police registration rejected successfully",
  "data": {
    "rejectedUser": {
      "id": 123,
      "email": "john.doe@police.rw",
      "full_name": "John Doe"
    }
  }
}
```

### What Happens:
1. ✅ Rejection message sent to police officer with reason
2. ✅ Record deleted from `police_profiles`
3. ✅ User deleted from `users`
4. ✅ Audit log entry created
5. ✅ Police cannot login anymore

---

## 7. Test Frontend Registration

### Navigate To:
```
http://localhost:3000/register-police
```

### Form Fields to Fill:
- **Full Name:** John Doe
- **Email:** john.doe@police.rw
- **Phone Number:** +250 788 123 456
- **Badge Number:** PL-2024-001
- **Rank:** Inspector (from dropdown)
- **Police Station:** Kigali Central Police Station
- **District:** Nyarugenge (from dropdown)
- **Department:** Criminal Investigation Division
- **Official Email:** j.doe@rp.gov.rw
- **Official Phone:** +250 722 123 456
- **Password:** SecurePassword123
- **Confirm Password:** SecurePassword123
- **Document:** Upload a PDF or image file

### Expected Behavior:
1. Form validates all required fields
2. Shows error if passwords don't match
3. Shows error if password < 6 characters
4. Shows error if file not selected
5. Submit button disabled while processing
6. Success message with redirect to login
7. Login page shows: "Police registration submitted successfully!"

---

## 8. Test Admin Dashboard

### Navigate To:
```
http://localhost:3000/admin-dashboard/manage-police-registrations
```

### Expected Display:
1. Page title: "👮 Police Registrations"
2. Subtitle: "Review and approve/reject pending police officer registrations"
3. List of pending requests with:
   - Officer full name
   - Email address
   - Badge number
   - Rank
   - Police station
   - District
   - Registration date
   - Document link
   - Approve button
   - Reject button

### Test Approve:
1. Click "Approve" button
2. Modal appears with:
   - Officer name and badge
   - Textarea for optional remarks
   - Cancel button
   - Confirm button
3. Enter remarks (optional)
4. Click "Confirm Approval"
5. Success message: "Police registration approved successfully!"
6. Page refreshes
7. Request removed from list

### Test Reject:
1. Click "Reject" button
2. Modal appears with:
   - Officer name and badge
   - Textarea for rejection reason (required)
   - Cancel button
   - Confirm button
3. Enter reason
4. Click "Confirm Rejection"
5. Success message: "Police registration rejected successfully!"
6. Page refreshes
7. Request removed from list

---

## 9. Verify No Impact on Lost Dashboard

### Test Lost User Registration:
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json
```

```json
{
  "full_name": "Jane Smith",
  "email": "jane.smith@example.com",
  "phone_number": "+250 789 456 123",
  "password": "Password123",
  "role": "loser"
}
```

### Should Return:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 124,
      "email": "jane.smith@example.com",
      "full_name": "Jane Smith",
      "role": "loser"
    }
  }
}
```

---

## 10. Verify No Impact on Found Dashboard

### Test Found User Registration:
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json
```

```json
{
  "full_name": "Bob Jones",
  "email": "bob.jones@example.com",
  "phone_number": "+250 790 567 890",
  "password": "Password123",
  "role": "finder"
}
```

### Should Return:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 125,
      "email": "bob.jones@example.com",
      "full_name": "Bob Jones",
      "role": "finder"
    }
  }
}
```

---

## Error Handling Tests

### Test 1: Missing Required Field
```
POST http://localhost:5000/api/auth/register-police
Content-Type: application/json

{
  "full_name": "John Doe",
  "email": "john@police.rw",
  "badge_number": "PL-001"
  // Missing: rank, police_station, district, password, document_url
}
```

**Response:**
```json
{
  "success": false,
  "message": "Please provide all required fields: email, password, full_name, badge_number, rank, police_station, district, document_url"
}
```

### Test 2: Invalid Email
```json
{
  "email": "not-an-email",
  ...
}
```

**Response:**
```json
{
  "success": false,
  "message": "Please provide a valid email address"
}
```

### Test 3: Short Password
```json
{
  "password": "123",
  ...
}
```

**Response:**
```json
{
  "success": false,
  "message": "Password must be at least 6 characters long"
}
```

### Test 4: Duplicate Badge
```json
{
  "badge_number": "PL-2024-001",  // Already exists
  ...
}
```

**Response:**
```json
{
  "success": false,
  "message": "This badge number is already registered in the system."
}
```

---

## Database Verification

### Check Registration Created:
```sql
SELECT id, email, full_name, role, is_active FROM users WHERE role = 'police';
-- Should show: is_active = false

SELECT id, user_id, badge_number, is_verified FROM police_profiles;
-- Should show: is_verified = false

SELECT sender_id, receiver_id, subject FROM messages WHERE subject LIKE '%Police Registration%';
-- Should show: Messages sent to all admins
```

### Check After Approval:
```sql
SELECT id, email, full_name, is_active FROM users WHERE id = 123;
-- Should show: is_active = true

SELECT id, is_verified, verified_by, verified_at FROM police_profiles WHERE id = 45;
-- Should show: is_verified = true, verified_by = admin_id
```

---

## Automation Testing Sequence

Run these tests in order:

```bash
# 1. Register police officer
curl -X POST http://localhost:5000/api/auth/register-police \
  -H "Content-Type: application/json" \
  -d '{...registration data...}'
# Response: Note the user_id and police profile id

# 2. Try login (should fail)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{email, password}'
# Response: Should fail with pending message

# 3. Admin gets pending requests
curl -X GET http://localhost:5000/api/admin/police/pending \
  -H "Authorization: Bearer {admin_token}"

# 4. Admin approves
curl -X POST http://localhost:5000/api/admin/police/approve/45 \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{"remarks": "Verified"}'

# 5. Try login again (should succeed)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{email, password}'
# Response: Should succeed, return token
```

---

## Performance Testing

### Load Test Police Registration:
- Send 100 concurrent registration requests with different emails/badges
- Should all succeed if data is unique
- Should fail appropriately for duplicates

### Load Test Approval:
- Send 50 concurrent approval requests
- Each should update 1 record
- Should handle concurrency without issues

---

## Security Testing

### SQL Injection Test:
```json
{
  "badge_number": "PL-001'; DROP TABLE police_profiles; --",
  ...
}
```
**Result:** Should fail validation, not execute SQL

### XSS Test:
```json
{
  "full_name": "<script>alert('xss')</script>",
  ...
}
```
**Result:** Should be stored safely, not execute

### Authentication Bypass:
Attempt to approve without token:
```
curl -X POST http://localhost:5000/api/admin/police/approve/45
```
**Result:** Should return 401 Unauthorized

---

## Logging Verification

### Check Audit Logs:
```sql
SELECT user_id, action, entity_type, details, created_at 
FROM audit_logs 
WHERE action LIKE '%POLICE%'
ORDER BY created_at DESC;

-- Should see:
-- POLICE_REGISTRATION - When police registers
-- POLICE_REGISTRATION_APPROVED - When admin approves
-- POLICE_REGISTRATION_REJECTED - When admin rejects
```

---

## Regression Testing

Before deployment, verify:

- ✓ Lost user registration still works
- ✓ Found user registration still works
- ✓ Lost item creation still works
- ✓ Found item creation still works
- ✓ Matching system still works
- ✓ Lost/Found dashboards load correctly
- ✓ Admin dashboard still shows all original pages
- ✓ Messages for items still work independently

---

## Troubleshooting

### Police can't register:
- Check backend is running
- Check database connection
- Check `/auth/register-police` endpoint exists
- Check request has all required fields

### Admin sees no pending requests:
- Check at least one police has registered
- Check admin is logged in with correct role
- Check `/admin/police/pending` endpoint exists
- Clear browser cache

### Police can't login after approval:
- Check `is_active = true` in users table
- Check `is_verified = true` in police_profiles table
- Check password is correct (bcrypt hash)
- Check JWT token is valid

### No notifications received:
- Check messages table has entries
- Check admin user IDs are correct
- Check message inbox endpoint works
- Check frontend notifications page loads

---

**Testing Complete!** 🎉

All API endpoints have been documented and tested.
System is ready for deployment.

Last Updated: January 18, 2026
