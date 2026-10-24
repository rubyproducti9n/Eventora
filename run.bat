@echo off
title Eventora - AI Event Planning Assistant
cd /d "%~dp0"

echo ===================================================
echo           Starting Eventora Server
echo ===================================================
echo.
echo Application will be available at:
echo    http://localhost:3000
echo.
echo Note: This script will NOT auto-open your browser.
echo Open the URL manually when the server is ready.
echo Press Ctrl+C in this window to stop the server.
echo.

npm run dev

pause
