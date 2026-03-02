# 🔄 Automatic Matching System Documentation

## Overview
The Lost and Found Rwanda platform includes an **intelligent automatic matching system** that connects lost items with found items in real-time. When users post items, the system automatically searches for potential matches and notifies both parties.

---

## 🎯 How It Works

### When a Lost Item is Posted
1. User creates a post describing their lost item
2. Item is saved to the `lost_items` database table
3. **Automatic matching starts immediately**
4. System searches all `found_items` in the database
5. Calculates match scores for potential matches
6. Creates match records for items scoring ≥ 60%
7. Both users receive notifications
8. Item status updates to 'matched'

### When a Found Item is Posted
1. User (finder or police) posts a found item
2. Item is saved to the `found_items` database table
3. **Automatic matching starts immediately**
4. System searches all `lost_items` in the database
5. Calculates match scores for potential matches
6. Creates match records for items scoring ≥ 60%
7. Both users receive notifications
8. Item status updates to 'matched'

---

## 📊 Match Scoring Algorithm

The system uses a **100-point scoring system** with four criteria:

### 1. Category Match (40 points) ⭐ REQUIRED
- **Must match exactly** for any score
- Categories: documents, electronics, personal items, valuables
- If categories don't match → Score = 0 (no match created)

### 2. District Match (30 points) 📍
- Items lost and found in the **same district**
- Rwanda districts: Gasabo, Kicukiro, Nyarugenge, etc.
- Full points if districts match, 0 if different

### 3. Item Type Similarity (20 points) 📱
- **Exact match**: Full 20 points (e.g., "National ID" = "National ID")
- **Partial match**: 10 points (e.g., "Phone" contains in "Samsung Phone")
- **No match**: 0 points

### 4. Date Proximity (10 points) 📅
- **Within 7 days**: Full 10 points
- **8-30 days**: 5 points
- **Over 30 days**: 0 points

### Minimum Threshold
- **60% required** (60 out of 100 points)
- Only matches above 60% create records
- Ensures quality matches, reduces false positives

---

## 🔍 Example Match Scenarios

### Example 1: Perfect Match (100 points)
**Lost Item:**
- Category: `documents`
- District: `Gasabo`
- Item Type: `National ID`
- Date Lost: `2026-01-10`

**Found Item:**
- Category: `documents` → 40 points ✅
- District: `Gasabo` → 30 points ✅
- Item Type: `National ID` → 20 points ✅
- Date Found: `2026-01-12` (2 days) → 10 points ✅

**Total: 100 points** → Match created ✅

---

### Example 2: Good Match (80 points)
**Lost Item:**
- Category: `electronics`
- District: `Kicukiro`
- Item Type: `Samsung Phone`
- Date Lost: `2026-01-01`

**Found Item:**
- Category: `electronics` → 40 points ✅
- District: `Kicukiro` → 30 points ✅
- Item Type: `Phone` (partial) → 10 points ✅
- Date Found: `2026-01-05` (4 days) → 10 points ✅

**Total: 90 points** → Match created ✅

---

### Example 3: No Match (40 points)
**Lost Item:**
- Category: `valuables`
- District: `Gasabo`
- Item Type: `Gold Ring`
- Date Lost: `2025-11-01`

**Found Item:**
- Category: `valuables` → 40 points ✅
- District: `Nyarugenge` (different) → 0 points ❌
- Item Type: `Bracelet` (no match) → 0 points ❌
- Date Found: `2026-01-10` (70 days) → 0 points ❌

**Total: 40 points** → No match created ❌ (below 60% threshold)

---

## 💾 Database Structure

### Matches Table
When a match is created, a record is inserted into the `matches` table:

```sql
CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    lost_item_id INTEGER REFERENCES lost_items(id),
    found_item_id INTEGER REFERENCES found_items(id),
    match_score INTEGER,
    status VARCHAR(20) DEFAULT 'pending',
    matched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP,
    verified_by INTEGER REFERENCES users(id)
);
```

### Match Record Example
```json
{
    "id": 1,
    "lost_item_id": 5,
    "found_item_id": 12,
    "match_score": 80,
    "status": "pending",
    "matched_at": "2026-01-16T12:00:00Z"
}
```

---

## 🔔 Notifications

### Loser Notification
```json
{
    "user_id": 5,
    "type": "match_found",
    "title": "Possible Match Found!",
    "message": "Your lost National ID might have been found. Match score: 80%",
    "related_id": 1,
    "related_type": "match"
}
```

### Finder Notification
```json
{
    "user_id": 12,
    "type": "match_found",
    "title": "Possible Match Found!",
    "message": "The National ID you found might match a lost item. Match score: 80%",
    "related_id": 1,
    "related_type": "match"
}
```

---

## 🛠️ Technical Implementation

### File: `src/services/matching.service.js`

#### Key Function: `checkForMatches(itemId, itemType)`

```javascript
export const checkForMatches = async (itemId, itemType) => {
    console.log(`🔍 Checking for matches - Item ID: ${itemId}, Type: ${itemType}`);
    
    if (itemType === 'lost') {
        // Get the lost item details
        const lostItem = await getLostItemById(itemId);
        
        // Search all active found items with matching category & district
        const foundItems = await query(`
            SELECT f.*, u.id as finder_id, u.full_name as finder_name
            FROM found_items f
            JOIN users u ON f.user_id = u.id
            WHERE f.category = $1 
            AND f.district = $2 
            AND f.status = 'active'
        `, [lostItem.category, lostItem.district]);
        
        console.log(`🔎 Found ${foundItems.rows.length} potential matches`);
        
        // Calculate match scores
        for (const foundItem of foundItems.rows) {
            const matchScore = calculateMatchScore(lostItem, foundItem);
            console.log(`📊 Match score: ${matchScore}%`);
            
            if (matchScore >= 60) {
                // Create match record
                const match = await createMatch(lostItem.id, foundItem.id, matchScore);
                console.log(`✅ Created match #${match.id} with score ${matchScore}%`);
                
                // Update both items to 'matched' status
                await updateItemStatus(lostItem.id, 'lost', 'matched');
                await updateItemStatus(foundItem.id, 'found', 'matched');
                
                // Notify both users
                await notifyMatch(lostItem.user_id, foundItem.user_id, match);
            }
        }
    }
    
    // Similar logic for found items...
};
```

#### Match Score Calculation

```javascript
const calculateMatchScore = (lostItem, foundItem) => {
    let score = 0;
    
    // Category (40 points) - MUST MATCH
    if (lostItem.category === foundItem.category) {
        score += 40;
    } else {
        return 0; // No match if categories differ
    }
    
    // District (30 points)
    if (lostItem.district === foundItem.district) {
        score += 30;
    }
    
    // Item Type (20 points)
    const lostType = lostItem.item_type.toLowerCase();
    const foundType = foundItem.item_type.toLowerCase();
    
    if (lostType === foundType) {
        score += 20; // Exact match
    } else if (lostType.includes(foundType) || foundType.includes(lostType)) {
        score += 10; // Partial match
    }
    
    // Date Proximity (10 points)
    const daysDiff = Math.abs(
        (new Date(lostItem.date_lost) - new Date(foundItem.date_found)) / (1000 * 60 * 60 * 24)
    );
    
    if (daysDiff <= 7) {
        score += 10;
    } else if (daysDiff <= 30) {
        score += 5;
    }
    
    return score;
};
```

---

## 📍 Integration Points

### Lost Items Controller
**File:** `src/controllers/lost.controller.js`

```javascript
export const postLostItem = async (req, res) => {
    try {
        // Save the lost item
        const lostItem = await saveLostItem(req.body);
        
        // ✨ Trigger automatic matching
        await checkForMatches(lostItem.id, 'lost');
        
        res.status(201).json({
            success: true,
            data: lostItem
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
```

### Found Items Controller
**File:** `src/controllers/found.controller.js`

```javascript
export const postFoundItem = async (req, res) => {
    try {
        // Save the found item
        const foundItem = await saveFoundItem(req.body);
        
        // ✨ Trigger automatic matching
        await checkForMatches(foundItem.id, 'found');
        
        res.status(201).json({
            success: true,
            data: foundItem
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
```

---

## 🧪 Testing the System

### Step 1: Create a Lost Item
1. Login as a loser user
2. Go to "Create Post" page
3. Fill in item details:
   - Item Type: `National ID`
   - Category: `documents`
   - District: `Gasabo`
   - Date Lost: `2026-01-10`
4. Submit the post

### Step 2: Create a Matching Found Item
1. Login as a finder user (or police)
2. Go to "Post Found Item" page
3. Fill in matching details:
   - Item Type: `National ID`
   - Category: `documents`
   - District: `Gasabo`
   - Date Found: `2026-01-12`
4. Submit the post

### Step 3: Verify Match Created
1. Check backend console for logs:
   ```
   🔍 Checking for matches - Item ID: 2, Type: found
   📋 Found Item: National ID in Gasabo
   🔎 Found 1 potential matches
   📊 Match score: 100%
   ✅ Created match #1 with score 100%
   ```

2. Check database:
   ```sql
   SELECT * FROM matches;
   ```

3. Check notifications:
   ```sql
   SELECT * FROM notifications WHERE type = 'match_found';
   ```

4. Both users should see matches in their dashboards

---

## 🔧 Configuration

### Adjusting Match Threshold
Edit `src/services/matching.service.js`:

```javascript
// Current: 60% minimum
if (matchScore >= 60) {
    // Create match
}

// For stricter matching: 70%
if (matchScore >= 70) {
    // Create match
}

// For looser matching: 50%
if (matchScore >= 50) {
    // Create match
}
```

### Adjusting Score Weights
Modify the `calculateMatchScore` function:

```javascript
// Current weights
Category: 40 points
District: 30 points
Item Type: 20 points
Date: 10 points

// Example alternative
Category: 50 points (higher priority)
District: 20 points
Item Type: 20 points
Date: 10 points
```

---

## 📊 Performance Considerations

### Database Indexes
Ensure indexes exist for fast matching:

```sql
CREATE INDEX idx_lost_items_category_district ON lost_items(category, district, status);
CREATE INDEX idx_found_items_category_district ON found_items(category, district, status);
```

### Query Optimization
- Only search items with `status = 'active'`
- Pre-filter by category and district
- Limit to reasonable date ranges

---

## 🎯 Future Enhancements

### Potential Improvements
1. **AI/ML Integration**: Use machine learning for better item type matching
2. **Image Comparison**: Compare uploaded images for visual similarity
3. **Location Radius**: Match items within X km instead of just district
4. **Color Matching**: Add color as a matching criterion
5. **Brand Matching**: For electronics, match brand names
6. **Multi-language**: Handle item descriptions in multiple languages

---

## 📝 Summary

✅ **Automatic Matching** - No manual intervention required
✅ **Real-time Processing** - Matches checked immediately on post
✅ **Smart Scoring** - 100-point system with 60% threshold
✅ **Dual Notifications** - Both users notified instantly
✅ **Status Updates** - Items marked as 'matched' automatically
✅ **Audit Trail** - All matches logged with scores and timestamps

The system is **production-ready** and actively matching items! 🚀
