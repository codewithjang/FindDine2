# Review Hide Feature - Code Changes Reference

## 1. Database Migration Needed

Run this command in the server directory:
```bash
cd server
npx prisma migrate dev --name add_isHidden_to_review
```

This will:
- Add `isHidden` Boolean field to the `review` table with default value of `false`
- Create migration files in `server/prisma/migrations/`

---

## 2. Files Modified

### ✅ server/prisma/schema.prisma
Added `isHidden Boolean @default(false)` to review model

### ✅ server/index.js
1. Updated `GET /api/reviews/:restaurantId` - Filter out hidden reviews
2. Updated `POST /api/reviews` - New reviews default to `isHidden: false`
3. Updated `GET /api/reviews/:restaurantId/summary` - Calculate based on visible reviews only
4. Added `PUT /api/reviews/:id/toggle-hide` - New toggle endpoint for admins
5. Kept `GET /api/reviews` (Admin) - Returns ALL reviews including hidden

### ✅ client/src/admin/AdminDashboard.js
Updated ManageReviews component:
- Changed from client-side state to API-based persistence
- Replaced `toggleHideReview` function to call `PUT /api/reviews/:id/toggle-hide`
- Shows all reviews with `isHidden` status indicator
- Updated UI to show hide/show buttons based on `review.isHidden`

### ⚪ client/src/MainPage.js
No changes needed - API filtering handles it automatically

### ⚪ client/src/RestaurantDetail.js
No changes needed - API filtering handles it automatically

---

## 3. API Endpoints

### Public Endpoints (Automatic Filtering)
```
GET /api/reviews/:restaurantId
- Returns reviews where isHidden = false
- Used by MainPage.js and RestaurantDetail.js

GET /api/reviews/:restaurantId/summary
- Calculates average and count based on isHidden = false reviews
```

### Admin Endpoints
```
GET /api/reviews
- Returns ALL reviews (including hidden ones)
- Used by AdminDashboard ManageReviews

PUT /api/reviews/:id/toggle-hide
- Toggles isHidden status for a review
- Request: PUT /api/reviews/123/toggle-hide
- Response: { success: true, review: {..., isHidden: true} }

DELETE /api/reviews/:id
- Permanently deletes a review
- Used by admin dashboard
```

---

## 4. Testing Checklist

### Backend Testing
- [ ] Database migration runs without errors
- [ ] `GET /api/reviews/1` returns only visible reviews
- [ ] `GET /api/reviews` (admin) returns all reviews
- [ ] `PUT /api/reviews/1/toggle-hide` toggles isHidden correctly
- [ ] Hidden reviews excluded from review summary calculations

### Frontend Testing
- [ ] Admin can see hide/show buttons in ManageReviews
- [ ] Clicking "ซ่อน" hides the review with visual feedback
- [ ] Clicking "แสดง" shows the hidden review again
- [ ] MainPage doesn't show hidden reviews
- [ ] RestaurantDetail doesn't show hidden reviews
- [ ] Review counts update correctly
- [ ] Ratings exclude hidden reviews

### Integration Testing
- [ ] Hide a review in admin dashboard
- [ ] Refresh MainPage and RestaurantDetail
- [ ] Verify the review is no longer visible
- [ ] Show the review again in admin dashboard
- [ ] Refresh MainPage and RestaurantDetail
- [ ] Verify the review appears again

---

## 5. Feature Behavior

### Admin View (AdminDashboard)
✅ Sees ALL reviews (hidden + visible)
✅ Can toggle visibility with buttons
✅ Can delete reviews
✅ Visual distinction between hidden and visible

### User View (MainPage, RestaurantDetail)
✅ Sees ONLY visible reviews
✅ Hidden reviews completely excluded
✅ Ratings calculated from visible reviews only
✅ Review counts reflect only visible reviews

---

## 6. Data Flow Diagram

```
Admin Hides Review
    ↓
PUT /api/reviews/:id/toggle-hide
    ↓
Database: isHidden = true
    ↓
GET /api/reviews/:restaurantId (filters isHidden = false)
    ↓
User won't see the review in MainPage or RestaurantDetail
    ↓
GET /api/reviews (admin endpoint - no filter)
    ↓
Admin still sees the review in AdminDashboard
```

---

## 7. Important Notes

⚠️ **Before Deployment:**
1. Backup your database
2. Run the migration: `npx prisma migrate dev --name add_isHidden_to_review`
3. Restart the server to load updated code
4. Test all workflows

📝 **Data Integrity:**
- Hidden reviews are NOT deleted from the database
- Admins can unhide reviews anytime
- Historical review data is preserved
- No data loss occurs

🔄 **Sync Behavior:**
- Changes are persistent across server restarts
- Admin actions immediately affect user views
- No client-side caching issues (API driven)

