# Hide/Show Review Feature - Visual Guide

## 🎯 Feature Overview

This document shows how the review hide/show feature works across the application.

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ADMIN DASHBOARD                              │
│                   (ManageReviews Component)                          │
│                                                                     │
│  • Sees ALL reviews (hidden + visible)                              │
│  • Can toggle visibility with API call                              │
│  • Visual indicators (strikethrough, opacity, color)                │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           │ PUT /api/reviews/:id/toggle-hide
                           │
        ┌──────────────────▼───────────────────┐
        │     DATABASE (review table)          │
        │  - isHidden: boolean (default false) │
        │  - All other review fields           │
        └──────────────────┬───────────────────┘
                           │
                ┌──────────┴──────────┐
                │                     │
    ┌───────────▼────────────┐  ┌────▼──────────────────┐
    │   Get All Reviews      │  │   Get Specific Rests  │
    │   (Admin - no filter)  │  │   (Public - filtered) │
    │   GET /api/reviews     │  │   GET /api/reviews/1  │
    │                        │  │   (isHidden = false)  │
    │   Returns: ALL reviews │  │   Returns: visible    │
    └───────────┬────────────┘  └────┬──────────────────┘
                │                    │
    ┌───────────▼────────────┐  ┌────▼──────────────────┐
    │  ADMIN DASHBOARD       │  │  USER-FACING PAGES    │
    │  • ManageReviews shows │  │  • MainPage.js        │
    │    all reviews         │  │  • RestaurantDetail   │
    │                        │  │                       │
    │  Example:              │  │  Example:             │
    │  ═══════════════════   │  │  ═══════════════════   │
    │  ✓ John - ⭐⭐⭐⭐⭐   │  │  ✓ John - ⭐⭐⭐⭐⭐   │
    │  ✓ Jane - ⭐⭐⭐⭐    │  │  ✓ Jane - ⭐⭐⭐⭐    │
    │  ⊘ Bob (HIDDEN)        │  │  (Bob not visible)    │
    │    Great food!         │  │                       │
    │    [Show] [Delete]     │  │                       │
    │                        │  │                       │
    └────────────────────────┘  └───────────────────────┘
```

---

## 🔄 User Interactions

### Admin Hiding a Review

```
ADMIN DASHBOARD
┌─────────────────────────────────────────┐
│ Review from "Bob"                       │
│ Rating: ⭐⭐⭐⭐⭐                        │
│ Comment: "Great food!"                  │
│                                         │
│ [SHOW/HIDE BUTTON] [DELETE BUTTON]     │
│                                         │
│ Action: Click "ซ่อน" (Hide)             │
└──────────────────┬──────────────────────┘
                   │
                   ▼
        API Call: PUT /api/reviews/123/toggle-hide
                   │
                   ▼
        Database Updates: isHidden = true
                   │
                   ▼
┌─────────────────────────────────────────┐
│ Review Card Updates (Admin View)        │
│ ⊘ Bob (HIDDEN)                          │
│ <strikethrough, gray, opacity-50>       │
│                                         │
│ [Show] [Delete]  ← Button changed       │
└─────────────────────────────────────────┘

IMMEDIATE EFFECT ON USER PAGES:
┌─────────────────────────────────────────┐
│ MainPage / RestaurantDetail              │
│ (API filters: isHidden = false)          │
│                                         │
│ Review NOT shown to users               │
│ Bob's review completely hidden          │
│ Review count: 2 (instead of 3)          │
│ Average rating updated                  │
└─────────────────────────────────────────┘
```

---

## 📋 Visual State Changes

### Review Card States

#### Visible Review (Default)
```
┌──────────────────────────────────────────────┐
│ John Doe                                     │
│ 🏪 Restaurant A                              │
│ ⭐ 4.5/5                          [HIDE][×] │
│                                              │
│ Great experience, highly recommended!       │
│                                              │
│ Nov 24, 2025                                 │
└──────────────────────────────────────────────┘

Button: "ซ่อน" (yellow-100 background)
Text: Normal color
Background: White
Opacity: 1
```

#### Hidden Review (After Hiding)
```
┌──────────────────────────────────────────────┐
│ ~~John Doe~~                                 │
│ 🏪 ~~Restaurant A~~                          │
│ ⭐ ~~4.5/5~~                      [SHOW][×] │
│                                              │
│ ~~Great experience, highly recommended!~~   │
│                                              │
│ ~~Nov 24, 2025~~                            │
└──────────────────────────────────────────────┘

Button: "แสดง" (blue-100 background)
Text: Gray strikethrough
Background: Gray-100
Opacity: 0.5
```

---

## 🔐 Access Control

### Admin (SuperUser)
```
✅ View all reviews (including hidden)
✅ Toggle hide/show status
✅ Delete reviews
✅ Manage review visibility
Location: Admin Dashboard > Manage Reviews tab
```

### Regular User
```
❌ Cannot see hidden reviews
❌ Cannot toggle visibility
❌ Can only submit new reviews
❌ Can read visible reviews only
Locations: MainPage, RestaurantDetail, Restaurant detail cards
```

---

## 🔄 State Management

### Old Way (Client-side)
```javascript
// ❌ Not used anymore
const [hiddenReviews, setHiddenReviews] = useState(new Set());
// Problem: State resets on page refresh
```

### New Way (Server-side)
```javascript
// ✅ Current implementation
const toggleHideReview = async (id) => {
  const res = await axios.put(`/api/reviews/${id}/toggle-hide`);
  // Database persists the state immediately
  setReviews(reviews.map(r => 
    r.id === id ? { ...r, isHidden: res.data.review.isHidden } : r
  ));
};
```

Benefits:
- ✅ Persistent across sessions
- ✅ Data stored in database
- ✅ Consistent across all users
- ✅ No state sync issues

---

## 📱 Page Behavior

### MainPage.js
```
USER VISITS MAIN PAGE
        ↓
GET /api/restaurants
        ↓
For each restaurant:
  GET /api/reviews/:restaurantId
        ↓
API filters: isHidden = false
        ↓
Display only visible reviews
Display rating (from visible only)
Display review count (visible only)
```

### RestaurantDetail.js
```
USER VISITS RESTAURANT DETAIL
        ↓
GET /api/restaurants/:id
        ↓
When user clicks "Reviews" tab:
  GET /api/reviews/:restaurantId
        ↓
API filters: isHidden = false
        ↓
Display only visible reviews
Calculate summary (from visible only)
Show review form
```

---

## 🔍 API Comparison

### GET /api/reviews (Admin)
```javascript
// Returns ALL reviews
{
  reviews: [
    { id: 1, name: "John", isHidden: false, ... },
    { id: 2, name: "Bob", isHidden: true, ... },    ← Hidden shown to admin
    { id: 3, name: "Jane", isHidden: false, ... }
  ]
}
```

### GET /api/reviews/:id (Public)
```javascript
// Returns only visible reviews
{
  reviews: [
    { id: 1, name: "John", isHidden: false, ... },
    { id: 3, name: "Jane", isHidden: false, ... }
                                                    ← Hidden excluded
  ]
}
```

---

## 📊 Data Flow Examples

### Scenario 1: Admin Hides a Bad Review
```
1. User submits negative review
   ID: 5, isHidden: false

2. Admin logs in, sees review in AdminDashboard

3. Admin clicks "ซ่อน" button
   PUT /api/reviews/5/toggle-hide

4. Review updated: isHidden: true

5. User visits MainPage:
   GET /api/reviews/1 (for restaurant 1)
   API returns only reviews where isHidden = false
   Review 5 NOT included
   Review count: 2 (was 3)
   Rating: recalculated without this review

6. Review permanently hidden from users
   Admin can unhide anytime
```

### Scenario 2: Admin Unhides a Review
```
1. Admin sees hidden review in AdminDashboard

2. Admin clicks "แสดง" button
   PUT /api/reviews/5/toggle-hide

3. Review updated: isHidden: false

4. User visits MainPage:
   GET /api/reviews/1
   API returns all visible reviews
   Review 5 NOW included
   Review count: 3 (was 2)
   Rating: recalculated with this review

5. Review visible to users again
```

---

## 🛠️ Troubleshooting

### If hidden reviews still appear:
1. ✅ Check database migration ran
2. ✅ Restart server
3. ✅ Clear browser cache
4. ✅ Hard refresh (Ctrl+Shift+R)

### If toggle button doesn't work:
1. ✅ Check admin has token in localStorage
2. ✅ Verify API endpoint exists
3. ✅ Check browser console for errors
4. ✅ Check server logs

### If review counts are wrong:
1. ✅ Verify API filters by isHidden
2. ✅ Check summary endpoint filtering
3. ✅ Refresh browser

---

## ✨ Summary

- **Admins** control which reviews are visible
- **Users** see only visible reviews
- **Data** is persistent in database
- **No caching issues** - API driven
- **Reversible** - hidden reviews can be unhidden anytime
- **Non-destructive** - reviews never permanently deleted unless explicitly deleted

