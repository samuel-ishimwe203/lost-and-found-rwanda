# 🔐 Login Credentials - Lost & Found Rwanda

## 👨‍💼 ADMIN ACCOUNT

**Email:** admin@lostandfound.rw  
**Password:** Admin@2026  
**Role:** Admin  
**Full Name:** System Administrator  
**Phone:** +250788000000

### Admin Capabilities:
- ✅ Full system access
- ✅ Create and manage police accounts
- ✅ View all users, items, matches
- ✅ Verify police officers
- ✅ Access audit logs
- ✅ System configuration
- ✅ Generate reports
- ✅ Manage all content

**Dashboard:** `/admin-dashboard`

---

## 👮 POLICE OFFICER ACCOUNT

**Email:** police@lostandfound.rw  
**Password:** Police@2026  
**Role:** Police  
**Full Name:** Officer Jean Claude  
**Phone:** +250788111111

### Police Profile Details:
- **Badge Number:** RNP-001
- **Rank:** Inspector
- **Police Station:** Remera Police Station
- **District:** Gasabo
- **Department:** Criminal Investigation Department (CID)
- **Official Phone:** +250788111111
- **Official Email:** police@lostandfound.rw
- **Verification Status:** ✅ Verified by Admin
- **Created By:** Admin (ID: 1)

### Police Capabilities:
- ✅ Upload found items (marked as police uploads)
- ✅ View all lost and found items
- ✅ Access full case details
- ✅ Communicate with losers and finders
- ✅ Mark items as returned to owners
- ✅ Generate police reports
- ✅ Manage assigned cases
- ✅ Access official documents

**Dashboard:** `/police-dashboard`

---

## 🧪 TEST USER ACCOUNTS (For Testing)

You can create test accounts for losers and finders:

### Test Loser Account:
**Register with:**
- Full Name: Test Loser
- Email: loser@gmail.com
- Phone: +250788222222
- Password: Test@123
- Role: I Lost an Item

**Dashboard:** `/lost-dashboard`

### Test Finder Account:
**Register with:**
- Full Name: Test Finder
- Email: finder@gmail.com
- Phone: +250788333333
- Password: Test@123
- Role: I Found an Item

**Dashboard:** `/found-dashboard`

---

## 🌐 Application URLs

**Frontend:** http://localhost:5173  
**Backend API:** http://localhost:3001/api  
**Health Check:** http://localhost:3001/health

---

## 📝 Quick Login Test Steps

### Test Admin Login:
1. Open http://localhost:5173
2. Click "Login" button (top right)
3. Enter: admin@lostandfound.rw / Admin@2026
4. Should redirect to `/admin-dashboard`

### Test Police Login:
1. Open http://localhost:5173
2. Click "Login" button (top right)
3. Enter: police@lostandfound.rw / Police@2026
4. Should redirect to `/police-dashboard`

### Test User Registration:
1. Open http://localhost:5173
2. Click "Register" button
3. Select role: "I Lost an Item" or "I Found an Item"
4. Fill form with valid email (e.g., test@gmail.com)
5. Click Register
6. Auto-login and redirect to appropriate dashboard

---

## 🔑 Password Requirements

All passwords must:
- ✅ Be at least 6 characters long
- ✅ Match confirmation password (during registration)
- ✅ Be stored hashed with bcrypt (10 salt rounds)

---

## 📧 Email Requirements

Only these email domains are accepted:
- ✅ gmail.com
- ✅ yahoo.com
- ✅ outlook.com
- ✅ hotmail.com
- ✅ icloud.com
- ✅ protonmail.com
- ✅ lostandfound.rw (official)

---

## 🎭 User Roles Breakdown

| Role | Can Register | Dashboard | Can Post Lost | Can Post Found | Police Access |
|------|--------------|-----------|---------------|----------------|---------------|
| **Admin** | No (Created by system) | `/admin-dashboard` | Yes | Yes | Yes |
| **Police** | No (Created by admin) | `/police-dashboard` | No | Yes (official) | Yes |
| **Loser** | Yes (Self-register) | `/lost-dashboard` | Yes | No | No |
| **Finder** | Yes (Self-register) | `/found-dashboard` | No | Yes | No |

---

## 🚀 Quick Commands

### Start Backend:
```bash
cd backend
npm run dev
# or
node server.js
```

### Start Frontend:
```bash
cd frontend
npm run dev
```

### Run Database Migrations:
```bash
cd backend
npm run migrate
```

### View All Users in Database:
```sql
SELECT id, email, full_name, role, is_active 
FROM users 
ORDER BY created_at;
```

### View Police Officers:
```sql
SELECT u.full_name, u.email, p.badge_number, p.rank, p.police_station 
FROM users u 
JOIN police_profiles p ON u.id = p.user_id 
WHERE u.role = 'police';
```

---

## ⚠️ Important Notes

1. **Change Default Passwords in Production!**
   - Admin@2026 and Police@2026 are for testing only
   - Use strong, unique passwords in production

2. **Admin Account is Unique**
   - Only one admin account (ID: 1)
   - Cannot be deleted
   - Use to create additional police officers

3. **Police Verification Required**
   - All police officers must be verified by admin
   - Verification grants full access to police features

4. **Email Must Be Unique**
   - Cannot register with existing email
   - Each email can only have one account

---

**System Ready!** Use these credentials to test all features! 🎉
