@echo off
REM INV-OTI - arranque local en Windows (base de datos + backend + frontend)
REM Doble clic en este archivo. Requiere Node.js 20 o superior (https://nodejs.org).
setlocal
cd /d "%~dp0"
title INV-OTI - servidor local

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] No se encontro Node.js. Instalalo desde https://nodejs.org y volve a abrir este archivo.
  pause
  exit /b 1
)

if not exist ".env" (
  echo DATABASE_URL="file:../db/custom.db"> .env
  echo JWT_SECRET="inv-oti-local-%RANDOM%%RANDOM%%RANDOM%">> .env
  echo [OK] Archivo .env creado.
)

if not exist "node_modules" (
  echo [1/3] Instalando dependencias ^(solo la primera vez, puede tardar^)...
  call npm install --no-audit --no-fund || goto :error
)

echo [2/3] Preparando la base de datos...
if not exist "db" mkdir db
set FIRST_RUN=0
if not exist "db\custom.db" set FIRST_RUN=1
call npx prisma generate || goto :error
call npx prisma db push --skip-generate || goto :error
if "%FIRST_RUN%"=="1" (
  echo Cargando usuarios y equipos de ejemplo...
  call npx --yes tsx scripts/seed.ts || goto :error
)

echo [3/3] Iniciando INV-OTI en http://localhost:3000/invtec.html
echo Para detenerlo, cerra esta ventana o presiona Ctrl+C.
start "" cmd /c "timeout /t 8 >nul & start http://localhost:3000/invtec.html"
call npx next dev -p 3000
goto :eof

:error
echo.
echo [ERROR] Algo fallo. Revisa los mensajes de arriba.
pause
exit /b 1
