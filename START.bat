@echo off
title Jaex Photography - Starting Server
echo.
echo  ========================================
echo     JAEX PHOTOGRAPHY - Starting Up...
echo  ========================================
echo.
echo  Your website will open automatically.
echo  Keep this window open - do not close it!
echo.

:: Check if node_modules exists
if not exist "node_modules" (
    echo  Installing dependencies... please wait
    call npm install
    call npm run build
)

echo  Starting server...
echo.
start http://localhost:3000/setup
call npm run dev
