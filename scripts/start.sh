#!/bin/sh
# Arranque en produccion: sincroniza el esquema, carga los datos demo solo
# la primera vez (base nueva) y levanta el servidor standalone de Next.js.
set -e

DB_FILE="${DATABASE_URL#file:}"
FIRST_RUN=0
[ -f "$DB_FILE" ] || FIRST_RUN=1

mkdir -p "$(dirname "$DB_FILE")"
npx prisma db push --skip-generate

if [ "$FIRST_RUN" = "1" ]; then
  bun scripts/seed.ts
fi

exec node .next/standalone/server.js
