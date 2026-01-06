# Firebase Setup Instructions

## Fixing "auth/unauthorized-domain" Error

This error occurs when your domain is not authorized in Firebase Console. Follow these steps:

### Step 1: Go to Firebase Console
1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **vivexa-admin**

### Step 2: Add Authorized Domains
1. Navigate to **Authentication** in the left sidebar
2. Click on **Settings** tab
3. Scroll down to **Authorized domains** section
4. Click **Add domain**
5. Add the following domains:
   - `localhost` (for local development)
   - `127.0.0.1` (alternative localhost)
   - Your production domain (when deploying)

### Step 3: Enable Google Sign-In Provider
1. In **Authentication** section, go to **Sign-in method** tab
2. Click on **Google** provider
3. Enable it if not already enabled
4. Add your project's support email
5. Click **Save**

### Step 4: Update Firestore Security Rules
**CRITICAL**: Copy and paste these rules exactly in Firebase Console > Firestore Database > Rules:

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

**Important Changes:**
- Users can now read their own user document (to check if they exist and are active)
- Super admin can read/write all user documents
- This fixes the "Missing or insufficient permissions" error

### Step 5: Create Initial Super Admin User
After logging in with `vivexatech@gmail.com`, you need to create the user document in Firestore:

1. Go to **Firestore Database** in Firebase Console
2. Create a collection named `users`
3. Create a document with ID = your Firebase Auth UID (from Authentication > Users)
4. Add the following fields:
   - `name` (string): Your name
   - `email` (string): vivexatech@gmail.com
   - `role` (string): admin
   - `isActive` (boolean): true
   - `createdAt` (timestamp): Current date/time

### Common Issues

**Issue**: Still getting unauthorized-domain error
- **Solution**: Make sure you added `localhost` (without port number) to authorized domains
- Clear browser cache and try again
- Make sure you're accessing via `http://localhost:3000` not `http://127.0.0.1:3000` (or add both)

**Issue**: Google Sign-In popup blocked
- **Solution**: Allow popups in your browser for localhost
- Check browser console for additional errors

**Issue**: Access Denied after login
- **Solution**: Make sure your user document exists in Firestore `users` collection with `isActive: true`

**Issue**: "Missing or insufficient permissions" error
- **Solution**: Update your Firestore rules to allow users to read their own user document (see Step 4 above)
- The rules must include: `allow read: if request.auth != null && (request.auth.uid == userId || isSuperAdmin());`

## Testing

After completing the setup:
1. Restart your React app (`npm start`)
2. Try logging in with Google
3. You should be redirected to the dashboard
