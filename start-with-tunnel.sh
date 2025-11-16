#!/bin/bash

echo "========================================"
echo "MelonAI - Starting with HTTPS Tunnel"
echo "========================================"
echo ""
echo "Langkah 1: Memulai Next.js dev server..."
echo ""

# Start Next.js in background
bun run dev &
NEXTJS_PID=$!

# Wait for Next.js to start
sleep 5

echo ""
echo "Langkah 2: Membuat HTTPS tunnel dengan ngrok..."
echo ""
echo "PENTING: Copy URL HTTPS yang muncul dan buka di HP Anda!"
echo ""

# Start ngrok
ngrok http 3000

# Cleanup on exit
kill $NEXTJS_PID
