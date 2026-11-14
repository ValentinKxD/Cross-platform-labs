@echo off
chcp 65001 >nul
cd /d "%~dp0"

start "PostProject API (4001)" cmd /k "cd /d "%~dp0..\PostProjectServer" && npm run dev"
start "PostProject Frontend (5173)" cmd /k "cd /d "%~dp0" && npm run dev"
