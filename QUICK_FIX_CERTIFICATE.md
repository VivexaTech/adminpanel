# Quick Fix: Missing Certificate Preset

## The Problem
Your `.env` file is missing or has a typo in `REACT_APP_CLOUDINARY_CERTIFICATE_PRESET`

## The Solution

### Step 1: Open your `.env` file
The file should be in the root directory: `D:\New folder\adminpanel\.env`

### Step 2: Add or Fix This Line

Make sure your `.env` file contains this EXACT line:

```env
REACT_APP_CLOUDINARY_CERTIFICATE_PRESET=intern_certificates
```

### Step 3: Complete .env File Should Look Like This

```env
REACT_APP_FIREBASE_API_KEY=AIzaSyArx3eeAj98XkXJqMtITF2I00sjm-LQDqs
REACT_APP_FIREBASE_AUTH_DOMAIN=vivexa-admin.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=vivexa-admin
REACT_APP_FIREBASE_STORAGE_BUCKET=vivexa-admin.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=68717817629
REACT_APP_FIREBASE_APP_ID=1:68717817629:web:a2a6dc32979f2b2d1fbbf4
REACT_APP_FIREBASE_MEASUREMENT_ID=G-CS75J9HF2X

REACT_APP_CLOUDINARY_CLOUD_NAME=drkvub4nq
REACT_APP_CLOUDINARY_PORTFOLIO_PRESET=vivexa_img
REACT_APP_CLOUDINARY_CERTIFICATE_PRESET=intern_certificates

REACT_APP_SUPER_ADMIN_EMAIL=vivexatech@gmail.com
```

### Step 4: Important Checks

✅ **No spaces around `=`**: 
- Correct: `REACT_APP_CLOUDINARY_CERTIFICATE_PRESET=intern_certificates`
- Wrong: `REACT_APP_CLOUDINARY_CERTIFICATE_PRESET = intern_certificates`

✅ **No quotes**:
- Correct: `REACT_APP_CLOUDINARY_CERTIFICATE_PRESET=intern_certificates`
- Wrong: `REACT_APP_CLOUDINARY_CERTIFICATE_PRESET="intern_certificates"`

✅ **Exact spelling**:
- Correct: `REACT_APP_CLOUDINARY_CERTIFICATE_PRESET`
- Wrong: `REACT_APP_CLOUDINARY_CERTIFICATE_PRESETS` (extra S)
- Wrong: `REACT_APP_CLOUDINARY_CERT_PRESET` (shortened)

### Step 5: RESTART YOUR APP

**CRITICAL**: After adding/fixing the variable:

1. **Stop the app** (Press `Ctrl+C` in terminal)
2. **Start it again**:
   ```bash
   npm start
   ```

React only reads environment variables when it starts!

### Step 6: Verify It Works

1. After restart, try uploading a certificate image
2. Check browser console - you should see:
   ```
   Certificate Preset Check: { preset: "intern_certificates", ... }
   ```
3. If you still see `undefined`, double-check the `.env` file spelling

## Still Not Working?

1. **Verify file location**: `.env` must be in root directory (same folder as `package.json`)
2. **Check for hidden characters**: Re-type the line manually
3. **Compare with Portfolio**: Since Portfolio works, copy that line format exactly and just change the variable name

## Quick Copy-Paste

If you want to be 100% sure, copy this entire section to your `.env`:

```env
REACT_APP_CLOUDINARY_CLOUD_NAME=drkvub4nq
REACT_APP_CLOUDINARY_PORTFOLIO_PRESET=vivexa_img
REACT_APP_CLOUDINARY_CERTIFICATE_PRESET=intern_certificates
```
