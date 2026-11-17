@echo off
cd /d "%~dp0"
start "PostProject Web (3000)" cmd /k "npm start -w postproject-web -- --open"
