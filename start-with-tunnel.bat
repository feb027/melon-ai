@echo off
echo ========================================
echo MelonAI - Starting with HTTPS Tunnel
echo ========================================
echo.
echo Langkah 1: Memulai Next.js dev server...
echo.

start "Next.js Dev Server" cmd /k "cd /d %~dp0 && bun run dev"

timeout /t 5 /nobreak >nul

echo.
echo Langkah 2: Membuat HTTPS tunnel dengan ngrok...
echo.
echo PENTING: Copy URL HTTPS yang muncul dan buka di HP Anda!
echo.

ngrok http 3000

pause
