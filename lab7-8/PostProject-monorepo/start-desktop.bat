@echo off
cd /d "%~dp0"
start "PostProject Desktop" cmd /k "npm run start:desktop"
