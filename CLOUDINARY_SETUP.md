# Cloudinary Setup Guide

## Fixing "400 Bad Request" Error

The 400 error from Cloudinary usually means:
1. Upload preset is not configured correctly
2. Preset is not set to "Unsigned" mode
3. Cloud name or preset name is incorrect

## Step-by-Step Setup

### Step 1: Create Cloudinary Account
1. Go to [Cloudinary Console](https://console.cloudinary.com/)
2. Sign up or log in to your account
3. Note your **Cloud Name** (e.g., `drkvub4nq`)

### Step 2: Create Upload Presets

You need to create **TWO** upload presets:

#### Preset 1: Portfolio Images
1. Go to **Settings** → **Upload** → **Upload presets**
2. Click **Add upload preset**
3. Set the following:
   - **Preset name**: `vivexa_img`
   - **Signing mode**: Select **Unsigned** (IMPORTANT!)
   - **Folder** (optional): `portfolio/`
   - **Format**: `Auto` or leave default
   - **Quality**: `Auto` or `80`
   - **Allowed formats**: `jpg, png, webp`
4. Click **Save**

#### Preset 2: Certificate Images
1. Click **Add upload preset** again
2. Set the following:
   - **Preset name**: `intern_certificates`
   - **Signing mode**: Select **Unsigned** (IMPORTANT!)
   - **Folder** (optional): `certificates/`
   - **Format**: `Auto` or leave default
   - **Quality**: `Auto` or `80`
   - **Allowed formats**: `jpg, png, webp, pdf`
3. Click **Save**

### Step 3: Verify Environment Variables

Make sure your `.env` file has:

```env
REACT_APP_CLOUDINARY_CLOUD_NAME=drkvub4nq
REACT_APP_CLOUDINARY_PORTFOLIO_PRESET=vivexa_img
REACT_APP_CLOUDINARY_CERTIFICATE_PRESET=intern_certificates
```

**Note**: You don't need `REACT_APP_CLOUDINARY_UPLOAD_URL` anymore - it's built automatically.

### Step 4: Restart Your App

After updating `.env`:
```bash
# Stop the app (Ctrl+C)
npm start
```

## Common Issues

### Issue: "400 Bad Request" Error

**Possible Causes:**
1. **Preset not set to Unsigned**
   - Solution: Go to Cloudinary Console → Settings → Upload presets
   - Edit your preset and change "Signing mode" to **Unsigned**

2. **Preset name mismatch**
   - Solution: Verify the preset name in `.env` matches exactly (case-sensitive)
   - Check Cloudinary Console → Settings → Upload presets

3. **Cloud name incorrect**
   - Solution: Verify `REACT_APP_CLOUDINARY_CLOUD_NAME` in `.env` matches your Cloudinary cloud name

4. **File too large**
   - Solution: The app now validates file size (max 10MB)
   - Compress images before uploading

### Issue: "Invalid preset" Error

- **Solution**: Make sure the preset exists and is set to "Unsigned" mode
- Double-check the preset name spelling in `.env`

### Issue: CORS Error

- **Solution**: Cloudinary should handle CORS automatically for unsigned uploads
- If you still get CORS errors, check browser console for specific error

## Testing

1. Try uploading a small image (< 1MB) first
2. Check browser console for detailed error messages
3. Verify the image appears in Cloudinary Media Library after upload

## Security Note

Since we're using **Unsigned** presets, anyone with the preset name can upload to your Cloudinary account. For production:
- Consider using signed uploads with API keys
- Set up folder restrictions
- Configure allowed file types and sizes in preset settings
