@echo off
cd /d "%~dp0"
start "PostProject Mobile (8081)" cmd /k "npm run web -w postproject-mobile"
