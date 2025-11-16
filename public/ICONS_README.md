# PWA Icons Generation

## Current Status
The `icon.svg` file contains the MelonAI logo design. To generate the required PNG icons for PWA:

## Option 1: Online Tools (Recommended for Quick Setup)
1. Visit https://realfavicongenerator.net/ or https://www.pwabuilder.com/imageGenerator
2. Upload `icon.svg`
3. Download the generated icons
4. Replace the placeholder files:
   - `icon-192x192.png`
   - `icon-512x512.png`

## Option 2: Using ImageMagick (Command Line)
If you have ImageMagick installed:

```bash
# Generate 192x192 icon
magick icon.svg -resize 192x192 icon-192x192.png

# Generate 512x512 icon
magick icon.svg -resize 512x512 icon-512x512.png
```

## Option 3: Using Node.js (sharp library)
```bash
bun add -D sharp

# Create a script to generate icons
node scripts/generate-icons.js
```

## Required Icons
- `icon-192x192.png` - For Android home screen
- `icon-512x512.png` - For splash screen and high-res displays

## Design Notes
- Background: Green (#22c55e) - represents maturity
- Main element: Watermelon slice with red flesh
- Seeds: Black for realism
- AI sparkle: Gold accent to indicate AI-powered
- Rounded corners: 128px radius for modern look

## Testing
After generating icons, test PWA installation on:
- Android Chrome (Add to Home Screen)
- iOS Safari (Add to Home Screen)
- Desktop Chrome (Install App)
