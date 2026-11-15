@echo off
chcp 65001 >nul
cd /d "%~dp0"

start "PostProject Desktop" cmd /k "cd /d "%~dp0" && npm start"
