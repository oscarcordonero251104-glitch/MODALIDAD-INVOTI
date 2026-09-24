-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuario" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'tecnico',
    "estado" TEXT NOT NULL DEFAULT 'activo',
    "solicitudReset" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Equipo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "sn" TEXT NOT NULL,
    "codigoInterno" TEXT,
    "descripcion" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'activo',
    "ubicacion" TEXT,
    "responsable" TEXT,
    "proveedor" TEXT,
    "factura" TEXT,
    "numeroContrato" TEXT,
    "costo" REAL NOT NULL DEFAULT 0,
    "fechaAdquisicion" TEXT,
    "fechaGarantia" TEXT,
    "vidaUtil" INTEGER NOT NULL DEFAULT 5,
    "especificaciones" TEXT,
    "notas" TEXT,
    "foto" TEXT,
    "diagnosticoPdf" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Movimiento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "equipoId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "fecha" TEXT NOT NULL,
    "descripcion" TEXT,
    "responsable" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Movimiento_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "Equipo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Mantenimiento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "equipoId" TEXT NOT NULL,
    "tipo" TEXT,
    "ubicacion" TEXT,
    "diagnostico" TEXT,
    "tecnicoDiagnostico" TEXT,
    "descripcion" TEXT,
    "fechaProgramada" TEXT,
    "fechaEjecucion" TEXT,
    "tecnico" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'Pendiente',
    "costo" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Mantenimiento_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "Equipo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_usuario_key" ON "User"("usuario");

-- CreateIndex
CREATE UNIQUE INDEX "Equipo_sn_key" ON "Equipo"("sn");

-- CreateIndex
CREATE UNIQUE INDEX "Equipo_codigoInterno_key" ON "Equipo"("codigoInterno");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");
