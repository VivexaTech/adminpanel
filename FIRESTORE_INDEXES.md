# Firestore Index Setup Guide

## Required Indexes for Employee Management

Firestore requires composite indexes when you query with both `where` and `orderBy` on different fields.

### Index 1: Staff Collection - Type and CreatedAt

**Collection**: `staff`
**Fields**:
- `type` (Ascending)
- `createdAt` (Descending)

**How to Create**:

1. **Automatic Method (Recommended)**:
   - When you see the error, click on the link provided in the error message
   - It will take you directly to the Firebase Console index creation page
   - Click **"Create Index"**
   - Wait for the index to build (usually 2-5 minutes)

2. **Manual Method**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project: **vivexa-admin**
   - Go to **Firestore Database** → **Indexes** tab
   - Click **"Create Index"**
   - Set:
     - Collection ID: `staff`
     - Fields to index:
       - Field: `type`, Order: **Ascending**
       - Field: `createdAt`, Order: **Descending**
   - Click **Create**

### Index 2: Tasks Collection - AssigneeId and CreatedAt

**Collection**: `tasks`
**Fields**:
- `assigneeId` (Ascending)
- `createdAt` (Descending)

**How to Create**:
- Same process as above
- Collection ID: `tasks`
- Fields: `assigneeId` (Ascending), `createdAt` (Descending)

### Index 3: Attendance Collection - StaffId and Date (Range Query)

**Collection**: `attendance`
**Fields**:
- `staffId` (Ascending)
- `date` (Ascending)

**Query Pattern**:
```javascript
where('staffId', '==', staffId)
where('date', '>=', startDate)
where('date', '<', endDate)
```

**How to Create**:
1. **Automatic Method (Recommended)**:
   - When you see the error, click on the link provided in the error message
   - It will take you directly to the Firebase Console index creation page
   - Click **"Create Index"**
   - Wait for the index to build (usually 2-5 minutes)

2. **Manual Method**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project: **vivexa-admin**
   - Go to **Firestore Database** → **Indexes** tab
   - Click **"Create Index"**
   - Set:
     - Collection ID: `attendance`
     - Fields to index:
       - Field: `staffId`, Order: **Ascending**
       - Field: `date`, Order: **Ascending**
   - Click **Create**

**Note**: This index is required for checking today's attendance. The code has a fallback that works without the index, but creating the index improves performance.

## Quick Fix (Temporary)

The code has been updated to work without indexes by:
1. Catching the index error
2. Fetching data without `orderBy`
3. Sorting in memory (JavaScript)

**Note**: This works but is less efficient. Create the indexes for better performance.

## Index Status

After creating an index:
- Status will show as **"Building"** (yellow)
- Wait until it shows **"Enabled"** (green)
- Usually takes 2-5 minutes
- You can continue using the app while it builds

## Why Indexes Are Needed

Firestore uses indexes to efficiently query data. When you combine:
- `where('type', '==', 'employee')` 
- `orderBy('createdAt', 'desc')`

Firestore needs a composite index to:
1. Filter by `type`
2. Sort by `createdAt`

Without the index, Firestore can't efficiently execute the query.

## Testing

After creating indexes:
1. Wait for index status to be "Enabled"
2. Refresh your admin panel
3. Navigate to Employee Management
4. The data should load with proper sorting
5. No more index errors!
