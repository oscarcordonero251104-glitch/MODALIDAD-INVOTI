#!/bin/sh
# INV-OTI - arranque local en macOS/Linux (base de datos + backend + frontend)
# Uso: sh iniciar-local.sh   (requiere Node.js 20 o superior)
set -e
cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  echo "[ERROR] No se encontro Node.js. Instalalo desde https://nodejs.org"
  exit 1
fi

if [ ! -f .env ]; then
  {
    echo 'DATABASE_URL="file:../db/custom.db"'
    echo "JWT_SECRET=\"inv-oti-local-$(od -An -N16 -tx1 /dev/urandom | tr -d ' \n')\""
  } > .env
  echo "[OK] Archivo .env creado."
fi

if [ ! -d node_modules ]; then
  echo "[1/3] Instalando dependencias (solo la primera vez, puede tardar)..."
  npm install --no-audit --no-fund
fi

echo "[2/3] Preparando la base de datos..."
mkdir -p db
FIRST_RUN=0
[ -f db/custom.db ] || FIRST_RUN=1
npx prisma generate
npx prisma db push --skip-generate
if [ "$FIRST_RUN" = "1" ]; then
  echo "Cargando usuarios y equipos de ejemplo..."
  npx --yes tsx scripts/seed.ts
fi

echo "[3/3] Iniciando INV-OTI en http://localhost:3000/invtec.html (Ctrl+C para detener)"
exec npx next dev -p 3000
