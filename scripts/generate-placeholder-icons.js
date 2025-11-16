#!/usr/bin/env node

/**
 * Generate placeholder PWA icons
 * 
 * This script creates simple placeholder PNG icons for PWA.
 * For production, use proper icon generation tools as described in public/ICONS_README.md
 * 
 * Usage: node scripts/generate-placeholder-icons.js
 */

const fs = require('fs');
const path = require('path');

// Simple function to create a colored square PNG (minimal valid PNG)
function createPlaceholderIcon(size, color) {
  // This is a minimal valid PNG file (1x1 pixel) in base64
  // We'll create a simple colored square
  const canvas = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" rx="${size * 0.25}" fill="${color}"/>
      <circle cx="${size/2}" cy="${size/2}" r="${size * 0.3}" fill="#ef4444"/>
      <text x="${size/2}" y="${size/2}" font-size="${size * 0.4}" text-anchor="middle" 
            dominant-baseline="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold">🍉</text>
    </svg>
  `;
  
  return canvas;
}

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate SVG placeholders (browsers can use these)
const icon192 = createPlaceholderIcon(192, '#22c55e');
const icon512 = createPlaceholderIcon(512, '#22c55e');

fs.writeFileSync(path.join(publicDir, 'icon-192x192.svg'), icon192);
fs.writeFileSync(path.join(publicDir, 'icon-512x512.svg'), icon512);

console.log('✅ Placeholder icon SVGs generated!');
console.log('📝 Note: For production, generate proper PNG icons using the instructions in public/ICONS_README.md');
console.log('   You can use online tools like https://realfavicongenerator.net/');
