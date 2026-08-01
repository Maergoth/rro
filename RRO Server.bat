@echo off
title RRO Server
cd /d "%~dp0"
echo ============================================
echo   Rush ^& Revenue Online - Game Server
echo ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH.
    echo Download it from https://nodejs.org/
    pause
    exit /b 1
)

if not exist "dist\server\index.js" (
    echo Building server...
    call npm run build:server
    if errorlevel 1 (
        echo ERROR: Server build failed.
        pause
        exit /b 1
    )
)

echo Starting server on 0.0.0.0:8788...
echo Press Ctrl+C to stop.
echo.
node --no-warnings dist/server/index.js
pause
