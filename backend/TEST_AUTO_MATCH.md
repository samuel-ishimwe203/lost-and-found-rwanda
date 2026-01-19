# Auto-Match Testing Guide

## What's Fixed

### 1. **Exact Duplicate Scan** 
- On server startup, `scanExactDuplicates()` finds all active lost items and found items with:
  - **Same category** (e.g., "documents", "valuables")
  - **Same image_url** (pixel-perfect match)
- Creates matches automatically
- Updates both items to status `'matched'` (hidden from landing page)
- Creates auto-messages for both parties

### 2. **Matching Logic Enhanced**
- No longer requires same district — only same category + image match
- 100% match score for identical images + category
- Items with match score ≥ 60% get matched

### 3. **Dashboard Statistics Updated**
- **Lost Dashboard**: Shows `activePostings`, `matchedItems`, `pendingMatches`, `resolvedItems`
- **Found Dashboard**: Shows `activeItems`, `matchedItems`, `returnedItems`, plus `totalRewardsEarned`
- Matched items are now properly counted separately

### 4. **Landing Page Auto-Hide**
- Public API filters: `status IN ('active', 'pending')`
- Matched items have status `'matched'` → automatically hidden

---

## How to Test

### **Step 1: Start Backend**
```bash
cd backend
npm install
# Set environment variables
$env:DATABASE_URL="your-database-url"
npm run start
# or: node server.js
```

Watch for startup messages:
```
🧹 Scanning for exact duplicate posts (category + image_url)
📋 Found X active lost items with images
✅ Exact duplicate scan completed: Y matches created, Z items hidden
```

### **Step 2: Post a Lost Item**
```bash
curl -X POST http://localhost:5000/api/lost-items \
  -H "Authorization: Bearer LOSER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "item_type": "National ID",
    "category": "documents",
    "description": "Lost my red national ID",
    "location_lost": "City Center",
    "district": "Gasabo",
    "date_lost": "2026-01-15",
    "reward_amount": 10000,
    "image_url": "/uploads/national-id-123.jpg"
  }'
# Response: { "id": 45, "status": "active", ... }
```

### **Step 3: Post a Found Item (Same Category + Image)**
```bash
curl -X POST http://localhost:5000/api/found-items \
  -H "Authorization: Bearer FINDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "item_type": "National ID",
    "category": "documents",
    "description": "Found a red national ID at the market",
    "location_found": "Market Area",
    "district": "Kicukiro",
    "date_found": "2026-01-15",
    "image_url": "/uploads/national-id-123.jpg"
  }'
# Expected: { "id": 98, "status": "active", ... }
# Then IMMEDIATELY: Auto-matching triggers
# Result: Both items change to status "matched"
```

### **Step 4: Verify Both Posts Are Hidden**
```bash
# Before match: Both items visible
curl "http://localhost:5000/api/public/items?category=documents"
# Response: { "lostItems": [{id: 45, ...}], "foundItems": [{id: 98, ...}] }

# After match: Both items hidden
curl "http://localhost:5000/api/public/items?category=documents"
# Response: { "lostItems": [], "foundItems": [], "total": 0 }
```

### **Step 5: Check Auto-Created Messages**
```bash
# Loser's inbox
curl -H "Authorization: Bearer LOSER_TOKEN" \
  http://localhost:5000/api/messages
# Response includes auto-message from finder with contact info

# Finder's inbox
curl -H "Authorization: Bearer FINDER_TOKEN" \
  http://localhost:5000/api/messages
# Response includes auto-message from loser with gratitude
```

### **Step 6: Check Dashboard Statistics**
```bash
# Loser's dashboard
curl -H "Authorization: Bearer LOSER_TOKEN" \
  http://localhost:5000/api/lost-items/stats
# Response: 
# {
#   "totalLostItems": 1,
#   "activePostings": 0,      ← Changed from 1 to 0
#   "matchedItems": 1,        ← Now shows matched count
#   "pendingMatches": 1,      ← Auto-match pending confirmation
#   "resolvedItems": 0,
#   "totalRewardOffered": 10000
# }

# Finder's dashboard
curl -H "Authorization: Bearer FINDER_TOKEN" \
  http://localhost:5000/api/found-items/stats
# Response:
# {
#   "totalFoundItems": 1,
#   "activeItems": 0,         ← Hidden from public
#   "matchedItems": 1,        ← Waiting for loser confirmation
#   "returnedItems": 0,
#   "totalRewardsEarned": 0   ← Only counted after completion
# }
```

### **Step 7: Test Duplicate Prevention**
Try posting another lost item with same category + image:
```bash
curl -X POST http://localhost:5000/api/lost-items \
  -H "Authorization: Bearer ANOTHER_LOSER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "item_type": "National ID",
    "category": "documents",
    "location_lost": "Different Location",
    "district": "Nyarugenge",
    "date_lost": "2026-01-16",
    "image_url": "/uploads/national-id-123.jpg"
  }'

# Expected Response (409 Conflict):
# {
#   "success": false,
#   "message": "Duplicate item detected! This item already exists...",
#   "error": "DUPLICATE_ITEM",
#   "existingItem": {
#     "id": 45,
#     "item_type": "National ID",
#     "category": "documents",
#     "contact": "First Loser's Name"
#   }
# }
```

---

## Success Checklist

- [x] Server starts without errors
- [x] Matched items removed from landing page
- [x] Both users receive auto-messages
- [x] Dashboard shows matched/active counts correctly
- [x] Duplicate posts blocked with helpful message
- [x] Statistics reflect current state

---

## Troubleshooting

### Posts still showing in landing page after match
**Solution**: Check database directly:
```sql
SELECT id, status FROM lost_items WHERE id = 45;  -- Should be 'matched'
SELECT id, status FROM found_items WHERE id = 98; -- Should be 'matched'
```

### Messages not created
**Check**:
1. Both users exist in `users` table
2. Match was created in `matches` table
3. Check server logs for message creation errors

### Statistics not updating
**Check**:
1. User IDs are correct
2. Item statuses are properly set to 'matched'
3. Query uses correct column names

---

## Important Notes

- **First-time setup**: The startup scan will process all existing duplicates
- **Auto-match**: Happens immediately when found item is posted
- **Inactive posts**: Scan only processes `status = 'active'` items
- **District ignored**: Items match across all districts if category + image match
- **Message content**: Auto-messages include contact info and reward details

