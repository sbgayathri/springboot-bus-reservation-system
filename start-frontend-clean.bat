@echo off
setlocal

rem Remove conda from PATH
set PATH=C:\Windows\system32;C:\Windows;C:\Windows\System32\Wbem;C:\Windows\System32\WindowsPowerShell\v1.0\;C:\Program Files\nodejs\

rem Change to frontend directory
cd /d "C:\Users\gayat\OneDrive\Desktop\bus\bus-client"

echo Starting React frontend...
echo Node version:
node --version
echo NPM version:
npm --version

echo.
echo Starting development server...
npm start

pause
