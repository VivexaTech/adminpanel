# Environment Variables Setup

## Quick Fix for "Upload preset is required" Error

This error means your `.env` file is missing the Cloudinary preset variables or the app wasn't restarted.

### Step 1: Check Your .env File

Make sure your `.env` file in the root directory has these variables:

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

### Step 2: Important Notes

1. **No spaces around `=`**: `REACT_APP_CLOUDINARY_CLOUD_NAME=drkvub4nq` ✅ (correct)
   - NOT: `REACT_APP_CLOUDINARY_CLOUD_NAME = drkvub4nq` ❌ (wrong)

2. **No quotes needed**: Just the value directly
   - `REACT_APP_CLOUDINARY_CLOUD_NAME=drkvub4nq` ✅
   - NOT: `REACT_APP_CLOUDINARY_CLOUD_NAME="drkvub4nq"` ❌

3. **File location**: The `.env` file must be in the **root directory** (same level as `package.json`)

### Step 3: Restart Your App

**CRITICAL**: After creating or modifying `.env` file, you MUST restart your React app:

1. Stop the app (press `Ctrl+C` in terminal)
2. Start it again:
   ```bash
   npm start
   ```

React only reads environment variables when it starts, so changes won't take effect until you restart.

### Step 4: Verify Variables Are Loaded

After restarting, check the browser console. If you see an error about missing preset, the console will now show which environment variables are loaded.

### Common Issues

**Issue**: Variables still not loading after restart
- **Solution**: 
  - Make sure `.env` is in the root directory (not in `src/`)
  - Check for typos in variable names (must start with `REACT_APP_`)
  - Make sure there are no extra spaces
  - Try deleting `node_modules/.cache` and restarting

**Issue**: "Upload preset is required" error persists
- **Solution**: 
  - Double-check the preset names match exactly (case-sensitive)
  - Verify the presets exist in Cloudinary Console
  - Make sure presets are set to "Unsigned" mode

### File Structure

Your project should look like this:

```
adminpanel/
├── .env                    ← Must be here (root directory)
├── package.json
├── public/
├── src/
└── ...
```

### Testing

1. Create/update `.env` file with all variables
2. **Restart the app** (stop and start again)
3. Try uploading an image
4. Check browser console for any errors
