@echo off
echo Attempting to push code to GitHub...
cd /d "c:\Users\alekh\.gemini\antigravity\pdf-converter-glass"
"D:\Wondershare\unity hub\Git\cmd\git.exe" push -u origin main
echo.
echo If you see a login window, please provide your GitHub details.
echo If it finished, you can close this window.
pause
