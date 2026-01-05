# Fixing Certificate Upload Issue

Since Portfolio uploads work but Certificates don't, the issue is likely with the certificate preset configuration.

## Quick Diagnosis

1. **Open browser console** (F12) when trying to upload a certificate
2. Look for the log message: `Certificate Preset Check:`
3. Check what values are shown

## Common Issues & Fixes

### Issue 1: Environment Variable Typo

**Check your `.env` file** - Make sure the variable name is EXACTLY:

```env
REACT_APP_CLOUDINARY_CERTIFICATE_PRESET=intern_certificates
```

Common typos:
- ❌ `REACT_APP_CLOUDINARY_CERTIFICATE_PRESETS` (extra S)
- ❌ `REACT_APP_CLOUDINARY_CERT_PRESET` (shortened)
- ❌ `REACT_APP_CLOUDINARY_CERTIFICATES_PRESET` (extra S in CERTIFICATES)
- ✅ `REACT_APP_CLOUDINARY_CERTIFICATE_PRESET` (correct)

### Issue 2: Preset Doesn't Exist in Cloudinary

1. Go to [Cloudinary Console](https://console.cloudinary.com/)
2. Navigate to **Settings** → **Upload** → **Upload presets**
3. Check if `intern_certificates` preset exists
4. If it doesn't exist:
   - Click **Add upload preset**
   - Name: `intern_certificates`
   - Signing mode: **Unsigned**
   - Save

### Issue 3: Preset Name Mismatch

The preset name in Cloudinary must match EXACTLY what's in your `.env`:

- If Cloudinary preset is: `intern_certificates`
- Then `.env` should be: `REACT_APP_CLOUDINARY_CERTIFICATE_PRESET=intern_certificates`

**Case-sensitive!** `intern_certificates` ≠ `Intern_Certificates`

### Issue 4: Preset Not Set to Unsigned

1. Go to Cloudinary Console → Settings → Upload presets
2. Find `intern_certificates` preset
3. Click **Edit**
4. Make sure **Signing mode** is set to **Unsigned**
5. Click **Save**

## Step-by-Step Fix

### Step 1: Verify .env File

Open your `.env` file and verify it has:

```env
REACT_APP_CLOUDINARY_CLOUD_NAME=drkvub4nq
REACT_APP_CLOUDINARY_PORTFOLIO_PRESET=vivexa_img
REACT_APP_CLOUDINARY_CERTIFICATE_PRESET=intern_certificates
```

### Step 2: Verify Cloudinary Preset

1. Go to Cloudinary Console
2. Settings → Upload → Upload presets
3. Verify `intern_certificates` exists
4. Verify it's set to **Unsigned**

### Step 3: Restart App

After any changes to `.env`:
```bash
# Stop app (Ctrl+C)
npm start
```

### Step 4: Test with Console

1. Open browser console (F12)
2. Try uploading a certificate image
3. Check the console log for `Certificate Preset Check:`
4. Verify the `preset` value is not `undefined`

## Quick Test

Compare these in browser console:

**Portfolio (working):**
```javascript
console.log('Portfolio preset:', process.env.REACT_APP_CLOUDINARY_PORTFOLIO_PRESET);
// Should show: "vivexa_img"
```

**Certificates (not working):**
```javascript
console.log('Certificate preset:', process.env.REACT_APP_CLOUDINARY_CERTIFICATE_PRESET);
// Should show: "intern_certificates" (not undefined)
```

If Certificate preset shows `undefined`, the environment variable is not being read.

## Still Not Working?

1. Check browser console for the detailed error message
2. Verify the preset exists in Cloudinary with exact name
3. Make sure preset is **Unsigned**
4. Try creating a new preset with a different name and update `.env`
