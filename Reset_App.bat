@echo off
cd /d "%~dp0"
echo Cleaning up...
taskkill /IM node.exe /F 2>nul
rmdir /s /q .next 2>nul
echo.
echo Starting Fresh...
echo URL: http://localhost:3005/translate
echo.
start "" "http://localhost:3005/translate"
call npm.cmd run dev -- -p 3005
pause
