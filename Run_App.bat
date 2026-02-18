@echo off
cd /d "%~dp0"
echo Starting PDF Converter & Translator App...
echo.
echo ========================================================
echo  1. Starting the server on PORT 3005...
echo  2. Use the "PDF Translator" tool on the homepage.
echo  3. URL: http://localhost:3005/translate
echo ========================================================
echo.
REM Start the browser slightly later to give server time to boot
start "" "http://localhost:3005/translate"
REM Force port 3005
call npm.cmd run dev -- -p 3005
pause
