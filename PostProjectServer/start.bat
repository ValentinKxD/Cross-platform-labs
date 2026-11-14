@echo off
chcp 65001 >nul
cd /d "%~dp0"
title PostProject API (4001)

rem Запуск лише серверної частини (GraphQL API + MongoDB) для вебверсії та мобільного застосунку
if not exist ".env" (
  echo Не знайдено файл .env. Скопіюйте .env.example у .env і вкажіть MONGO_URI, PORT та JWT_SECRET.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Встановлення залежностей...
  call npm install || (pause & exit /b 1)
)

call npm run dev
pause
