# Complete Firebase Setup Guide for Vivexa Tech Admin Panel

This guide will walk you through setting up Firebase for the admin panel step by step.

## Table of Contents
1. [Firebase Project Setup](#1-firebase-project-setup)
2. [Authentication Setup](#2-authentication-setup)
3. [Firestore Database Setup](#3-firestore-database-setup)
4. [Security Rules Configuration](#4-security-rules-configuration)
5. [Collections Structure](#5-collections-structure)
6. [Initial Data Setup](#6-initial-data-setup)
7. [Testing](#7-testing)

---

## 1. Firebase Project Setup

### Step 1.1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: **vivexa-admin**
4. Click **Continue**
5. (Optional) Enable Google Analytics - you can skip this
6. Click **Create project**
7. Wait for project creation, then click **Continue**

### Step 1.2: Register Web App
1. In your Firebase project, click the **Web icon** (`</>`)
2. Register app nickname: **Vivexa Admin Panel**
3. Check **"Also set up Firebase Hosting"** (optional)
4. Click **Register app**
5. Copy the Firebase configuration object (you'll need this for `.env` file)

---

## 2. Authentication Setup

### Step 2.1: Enable Google Sign-In
1. In Firebase Console, go to **Authentication** (left sidebar)
2. Click **Get started** (if first time)
3. Go to **Sign-in method** tab
4. Click on **Google** provider
5. Toggle **Enable** switch
6. Enter **Project support email**: `vivexatech@gmail.com`
7. Click **Save**

### Step 2.2: Add Authorized Domains
1. Still in **Authentication**, go to **Settings** tab
2. Scroll down to **Authorized domains** section
3. Click **Add domain**
4. Add the following domains:
   - `localhost` (for local development)
   - `127.0.0.1` (alternative localhost)
   - Your production domain (when deploying)

**Important**: Do NOT add port numbers (e.g., `localhost:3000` is wrong, use just `localhost`)

---

## 3. Firestore Database Setup

### Step 3.1: Create Firestore Database
1. In Firebase Console, go to **Firestore Database** (left sidebar)
2. Click **Create database**
3. Choose **Start in production mode** (we'll add security rules next)
4. Select a **location** (choose closest to your users, e.g., `asia-south1` for India)
5. Click **Enable**

### Step 3.2: Configure Firestore Indexes
Firestore will automatically prompt you to create indexes when needed. For now, you can skip this.

---

## 4. Security Rules Configuration

### Step 4.1: Update Security Rules
1. In **Firestore Database**, go to **Rules** tab
2. Replace the entire rules section with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSuperAdmin() {
      return request.auth != null &&
      request.auth.token.email == 'vivexatech@gmail.com';
    }

    function isAdminUser() {
      return request.auth != null &&
      exists(/databases/$(database)/documents/users/$(request.auth.uid));
    }

    // Users collection: Allow users to read their own document, super admin can read/write all
    match /users/{userId} {
      allow read: if request.auth != null && 
        (request.auth.uid == userId || isSuperAdmin());
      allow write: if isSuperAdmin();
    }

    match /portfolio/{docId} {
      allow read: if true;
      allow write: if isSuperAdmin();
    }

    match /intern-certificates/{docId} {
      allow read: if true;
      allow write: if isSuperAdmin();
    }

    match /clients/{docId} {
      allow read, write: if isAdminUser();
    }

    match /sales/{docId} {
      allow read, write: if isAdminUser();
    }

    match /invoices/{docId} {
      allow read, write: if isAdminUser();
    }

    match /staff/{docId} {
      allow read, write: if isAdminUser();
    }

    match /tasks/{docId} {
      allow read, write: if isAdminUser();
    }

    match /attendance/{docId} {
      allow read, write: if isAdminUser();
    }
  }
}
```

3. Click **Publish**

**What these rules do:**
- **Super Admin** (`vivexatech@gmail.com`): Full access to all collections
- **Admin Users**: Can read/write clients, sales, invoices, staff, tasks, and attendance
- **Public Read**: Portfolio and certificates are publicly readable (for public verification)
- **User Documents**: Users can read their own document to verify access

---

## 5. Collections Structure

Your Firestore will have the following collections:

### 5.1: `users` Collection
**Purpose**: Admin panel user access control

**Document ID**: Firebase Auth UID

**Fields**:
```javascript
{
  name: "Admin Name",           // string
  email: "vivexatech@gmail.com", // string
  role: "admin",                // string: "admin" | "staff"
  isActive: true,               // boolean
  createdAt: Timestamp,         // timestamp
  updatedAt: Timestamp          // timestamp (optional)
}
```

### 5.2: `clients` Collection
**Purpose**: Client information

**Fields**:
```javascript
{
  name: "Client Name",          // string
  email: "client@example.com",  // string
  phone: "+1234567890",         // string (optional)
  company: "Company Name",      // string (optional)
  totalBusiness: 0,             // number (auto-calculated)
  createdAt: Timestamp,         // timestamp
  updatedAt: Timestamp          // timestamp (optional)
}
```

### 5.3: `sales` Collection
**Purpose**: Sales records

**Fields**:
```javascript
{
  clientId: "client_doc_id",    // string (reference to clients)
  serviceName: "Service Name",  // string
  amount: 10000,                // number
  profit: 5000,                 // number
  date: Timestamp,              // timestamp
  createdAt: Timestamp          // timestamp
}
```

### 5.4: `invoices` Collection
**Purpose**: Invoice records

**Fields**:
```javascript
{
  invoiceNumber: "INV-1234567890", // string (auto-generated)
  clientId: "client_doc_id",        // string
  services: [                        // array
    {
      name: "Service Name",
      quantity: 1,
      price: 1000
    }
  ],
  totalAmount: 1000,                 // number
  tax: 180,                          // number
  pdfUrl: "https://...",             // string (optional)
  createdAt: Timestamp               // timestamp
}
```

### 5.5: `portfolio` Collection
**Purpose**: Portfolio projects

**Fields**:
```javascript
{
  title: "Project Title",        // string
  description: "Description",     // string
  imageUrl: "https://...",       // string (Cloudinary URL)
  tags: ["React", "Node.js"],    // array of strings
  url: "https://...",            // string (optional)
  timestamp: Timestamp           // timestamp
}
```

### 5.6: `intern-certificates` Collection
**Purpose**: Internship certificates

**Document ID**: Certificate ID (manually entered, used for public verification)

**Fields**:
```javascript
{
  studentName: "Student Name",   // string
  fatherName: "Father Name",     // string
  duration: "3 months",          // string (optional)
  startDate: "2024-01-01",       // string (optional)
  endDate: "2024-03-31",         // string (optional)
  score: "95%",                  // string (optional)
  certImage: "https://...",      // string (Cloudinary URL)
  createdAt: Timestamp           // timestamp
}
```

### 5.7: `staff` Collection
**Purpose**: Employees and Interns

**Fields**:
```javascript
{
  name: "Staff Name",            // string
  email: "staff@example.com",    // string
  phone: "+1234567890",          // string (optional)
  role: "Developer",             // string (optional)
  department: "IT",              // string (optional)
  joiningDate: Timestamp,        // timestamp
  status: "active",               // string: "active" | "inactive"
  type: "employee",              // string: "employee" | "intern"
  createdAt: Timestamp,          // timestamp
  updatedAt: Timestamp            // timestamp
}
```

### 5.8: `tasks` Collection
**Purpose**: Task management

**Fields**:
```javascript
{
  title: "Task Title",           // string
  description: "Task description", // string (optional)
  assigneeId: "staff_doc_id",    // string (reference to staff)
  status: "pending",              // string: "pending" | "in-progress" | "completed"
  dueDate: Timestamp,             // timestamp (optional)
  progress: 50,                   // number (0-100)
  createdAt: Timestamp,           // timestamp
  updatedAt: Timestamp             // timestamp
}
```

### 5.9: `attendance` Collection
**Purpose**: Attendance tracking

**Fields**:
```javascript
{
  staffId: "staff_doc_id",       // string (reference to staff)
  date: Timestamp,                // timestamp (date only)
  checkIn: Timestamp,             // timestamp (optional, for present status)
  checkOut: Timestamp,            // timestamp (optional, for present status)
  status: "present",              // string: "present" | "absent" | "leave"
  leaveType: "sick",              // string: "sick" | "casual" | "other" (optional)
  notes: "Additional notes",      // string (optional)
  createdAt: Timestamp,           // timestamp
  updatedAt: Timestamp             // timestamp
}
```

---

## 6. Initial Data Setup

### Step 6.1: Create Super Admin User Document

After logging in with `vivexatech@gmail.com` for the first time:

1. Go to **Firestore Database** → **Data** tab
2. Create a new collection: **users**
3. Create a document with ID = **Your Firebase Auth UID**
   - To find your UID: Go to **Authentication** → **Users** → Click on your user → Copy the **User UID**
4. Add the following fields:

| Field | Type | Value |
|-------|------|-------|
| `name` | string | Your Name |
| `email` | string | `vivexatech@gmail.com` |
| `role` | string | `admin` |
| `isActive` | boolean | `true` |
| `createdAt` | timestamp | Current date/time |

**Important**: The document ID MUST be your Firebase Auth UID, not a random ID!

### Step 6.2: Verify Setup
1. Log out and log back in
2. You should now have access to the admin panel
3. If you see "Access Denied", double-check:
   - Document ID matches your Auth UID exactly
   - `isActive` is set to `true`
   - Email matches exactly

---

## 7. Testing

### Test Authentication
1. Start your React app: `npm start`
2. Go to `http://localhost:3000`
3. Click "Sign in with Google"
4. Select your Google account (`vivexatech@gmail.com`)
5. You should be redirected to the dashboard

### Test Firestore Access
1. Try adding a client from the Clients page
2. Check Firestore Console → `clients` collection
3. You should see the new document

### Test Security Rules
1. Try accessing from a different Google account (not in `users` collection)
2. You should see "Access Denied" message
3. This confirms security rules are working

---

## Common Issues & Solutions

### Issue: "auth/unauthorized-domain" Error
**Solution**: 
- Go to Authentication → Settings → Authorized domains
- Add `localhost` (without port number)
- Restart your app

### Issue: "Missing or insufficient permissions"
**Solution**:
- Check Firestore security rules are published
- Verify your user document exists in `users` collection
- Ensure document ID is your Auth UID
- Check `isActive` is `true`

### Issue: Can't create collections
**Solution**:
- Collections are created automatically when you add the first document
- Just start adding data through the admin panel
- Collections will appear in Firestore Console

### Issue: Queries not working
**Solution**:
- Firestore will prompt you to create indexes
- Click the link in the error message
- Create the required index
- Wait for index to build (usually takes a few minutes)

---

## Environment Variables

Make sure your `.env` file has:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=vivexa-admin.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=vivexa-admin
REACT_APP_FIREBASE_STORAGE_BUCKET=vivexa-admin.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

Get these values from:
- Firebase Console → Project Settings → General → Your apps → Web app config

---

## Next Steps

1. ✅ Complete Firebase project setup
2. ✅ Configure authentication
3. ✅ Set up Firestore with security rules
4. ✅ Create initial super admin user
5. ✅ Test login and access
6. ✅ Start adding data through the admin panel

Your Firebase setup is now complete! 🎉
