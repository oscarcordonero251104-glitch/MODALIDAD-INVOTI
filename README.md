# INV-OTI · Sistema de Inventario de Equipos Informáticos

Sistema web **PWA offline-first** para la gestión de inventario de equipos informáticos, desarrollado para la **Oficina de Tecnología de la Información (OTI)**.

> Sistema de Inventario · Oficina de Tecnología de la Información

---

## 📋 Descripción

INV-OTI es una aplicación de grado industrial para el control y seguimiento de equipos informáticos. Permite registrar equipos, gestionar mantenimientos, rastrear movimientos, generar reportes y escanear códigos QR — todo funcionando **sin conexión a internet** gracias a su arquitectura PWA con IndexedDB.

### Características principales

- ✅ **Inventario centralizado** de equipos con números de serie únicos (formato `SN-AAAA-TIPO-NNNN`)
- ✅ **PWA instalable** — funciona offline y se instala como app nativa
- ✅ **Persistencia con IndexedDB (Dexie.js)** — los datos sobreviven recargas y reinicios
- ✅ **Sincronización offline→online** con cola de cambios y badges de estado
- ✅ **Escaneo QR real con cámara** (jsQR) para acceso rápido a fichas de equipos
- ✅ **Roles diferenciados**: Personal Administrativo (acceso total) y Técnico (operativo)
- ✅ **Dashboard con KPIs**, gráfico de barras, donut chart, alertas y timeline
- ✅ **Búsqueda global** con atajo Ctrl+K
- ✅ **Sistema de notificaciones toast**
- ✅ **Diseño responsive** — desktop, tablet y mobile

---

## 🛠️ Stack tecnológico

| Tecnología | Uso |
|---|---|
| **Vue 3** (CDN) | Framework reactivo (Composition API con `setup()`) |
| **Vue Router 4** (CDN) | Enrutamiento SPA con hash history |
| **Dexie.js** (CDN) | Wrapper de IndexedDB para persistencia offline |
| **jsQR** (CDN) | Decodificación de códigos QR desde la cámara |
| **CSS puro** | Sin frameworks — design system con custom properties |
| **Service Worker** | PWA offline-first con cache strategies |
| **Google Fonts** | Syne (display) · JetBrains Mono (datos) · DM Sans (cuerpo) |

> El archivo principal es **100% standalone** — un solo HTML que funciona abriéndolo en el navegador.

---

## 📁 Estructura del proyecto

```
public/
├── invtec.html        ← App completa (Vue 3 + CSS + JS en un solo archivo)
├── sw.js              ← Service Worker (PWA offline cache)
├── manifest.json      ← PWA manifest (instalable)
└── logo-enatrel.png   ← Logo institucional (transparente)

src/app/
└── page.tsx           ← Next.js entry (redirige a invtec.html#/login)
```

---

## 🚀 Cómo ejecutar

### Opción 1 — Abrir directo (sin servidor)
Abrí `public/invtec.html` en cualquier navegador moderno. Funciona completo excepto el Service Worker (requiere HTTPS o localhost).

### Opción 2 — Servidor de desarrollo (recomendado)
```bash
bun install
bun run dev
```
Abrí `http://localhost:3000` — redirige automáticamente al login.

---

## 🔐 Credenciales de demo

| Usuario | Contraseña | Rol | Acceso |
|---|---|---|---|
| `ADMIN` | `admin123` | Administrativo | Total (incluye gestión de usuarios) |
| `TECNICO` | `tecnico123` | Técnico | Operativo (sin gestión de usuarios) |

> Al abrir el programa vas directo al login. Las credenciales demo están visibles en el aviso de seguridad y son clickeables para autocompletar.

---

## 🗺️ Rutas

| Ruta | Vista | Acceso |
|---|---|---|
| `#/login` | Login institucional | Público |
| `#/registro` | Solicitud de acceso | Público |
| `#/` | Landing page | Público |
| `#/dashboard` | Dashboard con KPIs y gráficos | Autenticado |
| `#/equipos` | Lista de equipos (tabla/grid) | Autenticado |
| `#/equipos/nuevo` | Registrar nuevo equipo | Autenticado |
| `#/equipos/:id` | Detalle del equipo (4 tabs) | Autenticado |
| `#/equipos/:id/editar` | Editar equipo | Autenticado |
| `#/mantenimientos` | Lista de mantenimientos | Autenticado |
| `#/reportes` | Generación de reportes | Autenticado |
| `#/admin/usuarios` | Gestión de usuarios | Solo Administrativo |

---

## 🎨 Design System

Paleta de colores oscuros industriales (estilo SCADA/panel de control):

- **Fondos**: `#030810` → `#152340` (de más profundo a elevado)
- **Azules**: `#1d4ed8` → `#60a5fa` (acciones y acentos)
- **Estados**: verde (activo), ámbar (reparación), rojo (baja), gris (almacén), púrpura (préstamo)

Tipografía:
- **Syne** — títulos y display
- **JetBrains Mono** — datos, números de serie, etiquetas técnicas
- **DM Sans** — texto de lectura

---

## 📦 Funcionalidades por vista

### Dashboard
- 4 KPI cards (total equipos, activos, en reparación, costo total)
- Gráfico de barras "Distribución por tipo"
- Donut chart SVG "Equipos por estado"
- Alertas (garantía, mantenimiento, sin movimiento)
- Timeline de actividad reciente

### Equipos
- Tabla con 18 equipos reales (Dell, HP, Lenovo, Apple, Cisco, APC…)
- Filtros combinados (tipo, estado, ubicación, fecha) con tags activos
- Vista tabla / vista grid
- Paginación
- Detalle con 4 tabs: Info general, Movimientos, Mantenimientos, QR

### Formulario de equipo
- Validación reactiva en tiempo real
- Selects en cascada (Edificio → Piso → Sala)
- Autocomplete de responsable
- Drag & drop zone para foto
- Especificaciones técnicas en JSON

### PWA
- Service Worker con cache-first (assets) y network-first (navegación)
- Manifest instalable con logo
- Funciona 100% offline después de la primera carga

---

## 🔧 Desarrollo

```bash
# Instalar dependencias
bun install

# Servidor de desarrollo
bun run dev

# Verificar código
bun run lint
```

---

## 📄 Licencia

Proyecto desarrollado para la Oficina de Tecnología de la Información.

© INV-OTI · Oficina de Tecnología de la Información
