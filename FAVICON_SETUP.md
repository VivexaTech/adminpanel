# Favicon Setup

## Current Setup

I've added a simple SVG favicon with a "V" logo for Vivexa Tech.

## Files Created

- `public/favicon.svg` - SVG favicon (modern, scalable)

## Custom Favicon

If you want to use a custom favicon:

### Option 1: Replace SVG Favicon
1. Create your own `favicon.svg` file
2. Replace `public/favicon.svg`
3. The browser will automatically use it

### Option 2: Use ICO Format (Traditional)
1. Create a `favicon.ico` file (16x16, 32x32, or 48x48 pixels)
2. Place it in `public/favicon.ico`
3. The `index.html` already has the link tag for it

### Option 3: Use PNG Format
1. Create `favicon.png` files:
   - `favicon-16x16.png`
   - `favicon-32x32.png`
   - `apple-touch-icon.png` (180x180 for iOS)
2. Place them in `public/` folder
3. Update `public/index.html` to include:
   ```html
   <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
   <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
   <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
   ```

## Online Favicon Generators

If you need to create a favicon from an image:
- [Favicon.io](https://favicon.io/) - Generate from text or image
- [RealFaviconGenerator](https://realfavicongenerator.net/) - Comprehensive favicon generator
- [Favicon Generator](https://www.favicon-generator.org/) - Simple generator

## Current Favicon Location

The favicon is referenced in `public/index.html`:
```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="alternate icon" href="/favicon.ico" />
```

The browser will:
1. Try to load `/favicon.svg` first (modern browsers)
2. Fall back to `/favicon.ico` if SVG is not supported

## Testing

After adding/changing the favicon:
1. Hard refresh the browser (Ctrl+F5 or Cmd+Shift+R)
2. Clear browser cache if it doesn't update
3. Check the browser tab - you should see the favicon

## Note

The current SVG favicon uses:
- Gradient background (purple/indigo matching the app theme)
- White "V" letter for Vivexa Tech
- Rounded corners for modern look
