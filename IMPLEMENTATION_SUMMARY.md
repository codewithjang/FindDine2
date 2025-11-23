# Review Hide/Show Feature - Implementation Summary

## Overview
Successfully implemented a hide/show review feature for admins. When an admin hides a review, it is automatically excluded from all user-facing pages (MainPage and RestaurantDetail), but visible only in the admin dashboard.

## Changes Made

### 1. Database Schema (Backend)
**File:** `server/prisma/schema.prisma`
- Added `isHidden` boolean field to the `review` model
- Default value: `false`
- Migration needed: `npx prisma migrate dev --name add_isHidden_to_review`

```prisma
model review {
  id           Int        @id @default(autoincrement())
  restaurantId Int
  name         String     @db.VarChar(255)
  email        String?    @db.VarChar(255)
  rating       Float      @db.Float
  comment      String     @db.Text
  isHidden     Boolean    @default(false)  // NEW
  createdAt    DateTime?  @default(now()) @db.DateTime(0)
  restaurant   restaurant @relation("RestaurantReviews", fields: [restaurantId], references: [id], onDelete: Cascade, onUpdate: Restrict, map: "fk_review_restaurant")

  @@index([restaurantId], map: "fk_review_restaurant_fix")
}
```

### 2. Backend API Endpoints (Server)
**File:** `server/index.js`

#### Updated Endpoints:
1. **GET `/api/reviews/:restaurantId`** - Get reviews for a restaurant
   - Now filters out hidden reviews (`isHidden: false`)
   - Used by MainPage and RestaurantDetail
   - Non-admins only see visible reviews

2. **POST `/api/reviews`** - Add new review
   - New reviews default to `isHidden: false`

3. **GET `/api/reviews/:restaurantId/summary`** - Get review summary
   - Now calculates based only on visible reviews (`isHidden: false`)

4. **GET `/api/reviews`** - Get all reviews (Admin only)
   - Still returns ALL reviews including hidden ones
   - Admin dashboard uses this endpoint

#### New Endpoints:
5. **PUT `/api/reviews/:id/toggle-hide`** - Toggle review visibility (Admin)
   - Toggles the `isHidden` flag on/off
   - Returns updated review object
   - Used exclusively by admin dashboard

6. **DELETE `/api/reviews/:id`** - Delete review (Admin)
   - Unchanged functionality

### 3. Admin Dashboard
**File:** `client/src/admin/AdminDashboard.js`

#### ManageReviews Component Updates:
- Changed from client-side state (`hiddenReviews` Set) to server-side persistence
- Replaced `setHiddenReviews` with API calls to `PUT /api/reviews/:id/toggle-hide`
- Shows ALL reviews (including hidden ones) in admin dashboard
- Visual indicators:
  - **Hidden reviews**: Gray background, reduced opacity, strikethrough text, blue "แสดง" button
  - **Visible reviews**: White background, blue "ซ่อน" button

#### Features:
- Toggle visibility with "ซ่อน" (Hide) / "แสดง" (Show) button
- Delete functionality retained
- Search functionality works on all reviews
- Loading state during toggle operation
- Error handling with user feedback

### 4. User-Facing Pages

#### MainPage.js (`client/src/MainPage.js`)
- No changes needed
- Automatically shows only visible reviews
- API endpoint `GET /api/reviews/:restaurantId` now filters hidden reviews

#### RestaurantDetail.js (`client/src/RestaurantDetail.js`)
- No changes needed
- Automatically shows only visible reviews
- API endpoint `GET /api/reviews/:restaurantId` now filters hidden reviews
- Review summary calculations exclude hidden reviews

## User Flow

### Admin Workflow:
1. Admin logs in and goes to Admin Dashboard
2. Clicks on "⭐ จัดการรีวิว" tab
3. Can view ALL reviews (including hidden ones)
4. Click "ซ่อน" button to hide a review
5. Review immediately disappears from user-facing pages
6. Click "แสดง" button to show a hidden review again

### User Workflow:
1. User visits MainPage or RestaurantDetail
2. Only sees visible reviews
3. Hidden reviews are completely excluded from:
   - Review list display
   - Review count
   - Average rating calculation
   - Review summary

## Technical Specifications

### API Response Structure:
```json
{
  "success": true,
  "message": "Review hidden",
  "review": {
    "id": 123,
    "restaurantId": 456,
    "name": "John Doe",
    "email": "john@example.com",
    "rating": 4.5,
    "comment": "Great food!",
    "isHidden": true,
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
```

### Data Persistence:
- All hide/show states are stored in the database
- Changes are persistent across sessions
- No client-side state needed

## Next Steps (If Required):
1. Run the database migration: `npx prisma migrate dev --name add_isHidden_to_review`
2. Test the toggle functionality in the admin dashboard
3. Verify hidden reviews don't appear in MainPage/RestaurantDetail
4. Verify ratings and review counts update correctly

## Notes:
- Hidden reviews remain in the database (they are not deleted)
- Admins can always unhide reviews
- The feature maintains data integrity and allows for review management without permanent deletion
- Review rating averages automatically recalculate based on visible reviews only
