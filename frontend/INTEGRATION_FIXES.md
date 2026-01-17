# Frontend-Backend Integration Fixes

## ✅ Changes Applied

### 1. Environment Configuration
- **File:** `.env`
- **Added:** `VITE_API_URL=http://localhost:5000/api`
- **Purpose:** Connect frontend to backend API

### 2. AuthContext Implementation
- **File:** `src/context/AuthContext.jsx`
- **Changes:**
  - Uncommented and fully implemented authentication context
  - Added login, register, logout functions
  - Integrated with auth.service.js
  - Added automatic token validation on app load
  - Stores user state and authentication status

### 3. Main.jsx Provider Setup
- **File:** `src/main.jsx`
- **Added:** AuthProvider wrapper around the entire app
- **Purpose:** Make authentication available globally

---

## ⚠️ Critical Issues Requiring Manual Fixes

### Issue 1: Role Mapping Mismatch
**Backend roles:** `loser`, `finder`, `police`, `admin`  
**Frontend routes:** `/lost-dashboard`, `/found-dashboard`, `/police-dashboard`, `/admin-dashboard`

**Problem:** Frontend uses `lost_user` and `found_user`, backend uses `loser` and `finder`

**Fix Required in App.jsx:**
```jsx
// Current problematic code around line 50-70:
const handleLoginSuccess = (role) => {
  setIsAuthenticated(true);
  setUserRole(role); // This gets "loser" from backend, but frontend expects "lost_user"
};

// NEEDS TO BE CHANGED TO:
const handleLoginSuccess = (role) => {
  setIsAuthenticated(true);
  // Map backend roles to frontend roles
  const roleMap = {
    'loser': 'lost_user',
    'finder': 'found_user',
    'police': 'police',
    'admin': 'admin'
  };
  setUserRole(roleMap[role] || role);
  
  // Navigate to appropriate dashboard
  const dashboardMap = {
    'loser': '/lost-dashboard',
    'finder': '/found-dashboard',
    'police': '/police-dashboard',
    'admin': '/admin-dashboard'
  };
  navigate(dashboardMap[role] || '/');
};
```

### Issue 2: PostsContext Using LocalStorage
**File:** `src/context/PostsContext.jsx`

**Problem:** Currently stores posts in localStorage instead of fetching from backend API

**Fix Required:**
Replace localStorage logic with API calls:
```jsx
import apiClient from '../services/api';

export function PostsProvider({ children }) {
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch posts from backend on mount
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await apiClient.get('/public/items?type=all');
        setAllPosts(response.data.data.items || []);
      } catch (error) {
        console.error('Error loading posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const addPost = async (postData) => {
    try {
      // Determine endpoint based on post type
      const endpoint = postData.type === 'lost' ? '/lost-items' : '/found-items';
      const response = await apiClient.post(endpoint, postData);
      const newPost = response.data.data.lostItem || response.data.data.foundItem;
      setAllPosts((prev) => [newPost, ...prev]);
      return newPost;
    } catch (error) {
      console.error('Error adding post:', error);
      throw error;
    }
  };

  const deletePost = async (postId, postType) => {
    try {
      const endpoint = postType === 'lost' ? `/lost-items/${postId}` : `/found-items/${postId}`;
      await apiClient.delete(endpoint);
      setAllPosts((prev) => prev.filter((post) => post.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  };

  return (
    <PostsContext.Provider value={{ allPosts, addPost, deletePost, loading }}>
      {children}
    </PostsContext.Provider>
  );
}
```

### Issue 3: AuthModal Component Missing Integration
**File:** `src/components/AuthModal.jsx`

**Problem:** AuthModal likely has demo login logic, needs to use AuthContext

**Fix Required:**
```jsx
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isLogin) {
        const response = await login(formData);
        const role = response.user.role;
        
        // Navigate based on role
        const dashboardMap = {
          'loser': '/lost-dashboard',
          'finder': '/found-dashboard',
          'police': '/police-dashboard',
          'admin': '/admin-dashboard'
        };
        navigate(dashboardMap[role] || '/');
        onClose();
      } else {
        await register(formData);
        const role = formData.role;
        navigate(role === 'loser' ? '/lost-dashboard' : '/found-dashboard');
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    }
  };
  
  // ... rest of modal code
}
```

### Issue 4: Dashboard Components Using Demo Data
**Files:** All dashboard home pages

**Problem:** Dashboard stats and items are hardcoded, need API integration

**Example Fix for LostDashboardHome.jsx:**
```jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/api';

export default function LostDashboardHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch dashboard stats
        const statsRes = await apiClient.get('/lost-items/my/stats');
        setStats(statsRes.data.data);
        
        // Fetch my lost items
        const postsRes = await apiClient.get('/lost-items/my/items');
        setMyPosts(postsRes.data.data.lostItems);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Welcome back, {user?.full_name}!</h2>
      
      <div className="stats-grid">
        <StatCard title="Total Lost Items" value={stats.totalLostItems} />
        <StatCard title="Active Postings" value={stats.activePostings} />
        <StatCard title="Matches Found" value={stats.matchedItems} />
        <StatCard title="Total Reward Offered" value={`${stats.totalRewardOffered} RWF`} />
      </div>

      <div className="recent-posts">
        {myPosts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
```

### Issue 5: Field Name Mismatches
**Backend field names vs Frontend expected names:**

Backend uses:
- `item_type`
- `date_lost` / `date_found`
- `location_lost` / `location_found`
- `reward_amount`
- `additional_info`
- `full_name`
- `phone_number`

Make sure frontend forms and display components use these exact field names when making API calls.

---

## 🔧 Quick Integration Checklist

### Step 1: Update App.jsx
- [ ] Replace fake auth logic with AuthContext
- [ ] Add role mapping from backend to frontend
- [ ] Add proper navigation after login
- [ ] Remove location-based auth detection

### Step 2: Update AuthModal
- [ ] Import and use AuthContext
- [ ] Handle login/register with proper error handling
- [ ] Navigate to correct dashboard after auth
- [ ] Display backend error messages

### Step 3: Update PostsContext
- [ ] Replace localStorage with API calls
- [ ] Use `/public/items`, `/lost-items`, `/found-items` endpoints
- [ ] Handle loading and error states
- [ ] Map backend response fields

### Step 4: Update Dashboard Pages
- [ ] Replace demo data with API calls
- [ ] Use correct endpoints for stats
- [ ] Fetch user-specific data (my items, matches)
- [ ] Handle loading and empty states

### Step 5: Update Form Components
- [ ] Use backend field names
- [ ] Handle API errors properly
- [ ] Show success messages
- [ ] Refresh data after submit

### Step 6: Add Protected Routes
- [ ] Create ProtectedRoute component that checks AuthContext
- [ ] Redirect unauthenticated users to login
- [ ] Verify user role matches route requirements

---

## 📋 Data Structure Mapping

### User Object
**Backend response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "phone_number": "+250788123456",
  "role": "loser",
  "language_preference": "en",
  "is_active": true,
  "created_at": "2026-01-16T10:00:00.000Z"
}
```

**Frontend should store as-is** and map `role` for navigation only.

### Lost Item Object
**Backend response:**
```json
{
  "id": 1,
  "user_id": 1,
  "item_type": "National ID",
  "category": "Documents",
  "description": "Lost near bus station",
  "location_lost": "Remera",
  "district": "Gasabo",
  "date_lost": "2026-01-15",
  "reward_amount": 5000,
  "status": "active",
  "image_url": null,
  "additional_info": {},
  "created_at": "2026-01-16T10:00:00.000Z"
}
```

### Match Object
**Backend response:**
```json
{
  "id": 1,
  "lost_item_id": 5,
  "found_item_id": 3,
  "match_score": 85.50,
  "status": "pending",
  "loser_confirmed": false,
  "finder_confirmed": false,
  "reward_amount": 5000,
  "matched_at": "2026-01-16T11:00:00.000Z"
}
```

---

## 🚀 Testing Guide

### 1. Test Authentication
```bash
# Start backend (already running on port 5000)
# Start frontend
cd frontend
npm run dev
```

1. Open http://localhost:5173
2. Click "Report Lost Item" to open login modal
3. Login with admin credentials:
   - Email: admin@lostandfound.rw
   - Password: Admin@2026
4. Should redirect to /admin-dashboard

### 2. Test User Registration
1. Click register/sign up
2. Create loser account
3. Should redirect to /lost-dashboard
4. Check if user data appears correctly

### 3. Test Lost Item Posting
1. Login as loser
2. Go to "Create Post"
3. Fill form with proper field names
4. Submit
5. Check if item appears in backend database
6. Verify it appears in "My Postings"

### 4. Test Matching
1. Login as finder
2. Post found item matching existing lost item
3. Check if match notification appears
4. Verify match score and details

---

## 🔐 Security Notes

1. **Token Storage:** Currently using localStorage - consider httpOnly cookies for production
2. **CORS:** Backend allows all origins in development - restrict in production
3. **Rate Limiting:** Backend has 100 req/15min - adjust as needed
4. **Password Requirements:** Minimum 6 characters - enforce in frontend validation

---

## 📞 Support

After implementing these fixes:
1. Test all major user flows
2. Check browser console for errors
3. Verify API calls in Network tab
4. Check backend logs for any issues

The backend is fully functional and waiting for proper frontend integration!
