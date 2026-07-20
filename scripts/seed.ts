/* INV-OTI — Seed script
 * Puebla la base de datos con usuarios demo y equipos de ejemplo
 * Ejecutar con: bun run scripts/seed.ts
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de INV-OTI...')

  // --- Usuarios demo ---
  const adminPass = await bcrypt.hash('admin123', 10)
  const tecnicoPass = await bcrypt.hash('tecnico123', 10)

  const admin = await prisma.user.upsert({
    where: { usuario: 'ADMIN' },
    update: {},
    create: {
      usuario: 'ADMIN',
      password: adminPass,
      nombre: 'Administrador del Sistema',
      rol: 'admin',
      estado: 'activo',
    },
  })

  const tecnico = await prisma.user.upsert({
    where: { usuario: 'TECNICO' },
    update: {},
    create: {
      usuario: 'TECNICO',
      password: tecnicoPass,
      nombre: 'Técnico de Campo',
      rol: 'tecnico',
      estado: 'activo',
    },
  })

  console.log(`✅ Usuarios creados: ADMIN (admin), TECNICO (tecnico)`)

  // --- Equipos ---
  const equiposData = [
    {tipo:'Laptop',marca:'Dell',modelo:'Latitude 5440',sn:'SN-2024-LP-0001',codigoInterno:'INV-LP-001',estado:'activo',ubicacion:'Ingeniería',responsable:'María García',proveedor:'Dell Technologies',factura:'FAC-2024-0142',costo:16500,fechaAdquisicion:'2024-01-10',fechaGarantia:'2027-01-10',vidaUtil:5,especificaciones:{cpu:'Intel Core i7-1365U',ram:'16GB DDR5',ssd:'512GB NVMe',pantalla:'14" FHD 1920x1080'},notas:'Equipo principal del área de sistemas.'},
    {tipo:'Laptop',marca:'Lenovo',modelo:'ThinkPad X1 Carbon Gen 11',sn:'SN-2024-LP-0002',codigoInterno:'INV-LP-002',estado:'activo',ubicacion:'Ingeniería',responsable:'Carlos Pérez',proveedor:'Lenovo Argentina',factura:'FAC-2024-0089',costo:24000,fechaAdquisicion:'2024-02-05',fechaGarantia:'2027-02-05',vidaUtil:5,especificaciones:{cpu:'Intel Core i7-1365U',ram:'32GB DDR5',ssd:'1TB NVMe',pantalla:'14" WUXGA 1920x1200'},notas:''},
    {tipo:'Laptop',marca:'HP',modelo:'EliteBook 840 G10',sn:'SN-2024-LP-0003',codigoInterno:'INV-LP-003',estado:'reparacion',ubicacion:'Recursos humanos',responsable:'Ana Torres',proveedor:'HP Inc.',factura:'FAC-2024-0231',costo:17500,fechaAdquisicion:'2024-01-22',fechaGarantia:'2026-01-22',vidaUtil:5,especificaciones:{cpu:'Intel Core i5-1335U',ram:'16GB DDR5',ssd:'512GB NVMe',pantalla:'14" FHD 1920x1080'},notas:'En reparación: reemplazo de teclado.'},
    {tipo:'Laptop',marca:'Apple',modelo:'MacBook Pro 14 M3',sn:'SN-2024-LP-0004',codigoInterno:'INV-LP-004',estado:'activo',ubicacion:'Ingeniería',responsable:'Luis Ramírez',proveedor:'Apple Store',factura:'FAC-2024-0356',costo:38900,fechaAdquisicion:'2024-03-15',fechaGarantia:'2027-03-15',vidaUtil:5,especificaciones:{cpu:'Apple M3 Pro',ram:'18GB Unified',ssd:'512GB SSD',pantalla:'14" Liquid Retina XDR'},notas:''},
    {tipo:'Laptop',marca:'Acer',modelo:'TravelMate P4 TMP414',sn:'SN-2023-LP-0005',codigoInterno:'INV-LP-005',estado:'almacen',ubicacion:'Almacén',responsable:'—',proveedor:'Acer LATAM',factura:'FAC-2023-0788',costo:9200,fechaAdquisicion:'2023-08-12',fechaGarantia:'2025-08-12',vidaUtil:5,especificaciones:{cpu:'Intel Core i3-1215U',ram:'8GB DDR4',ssd:'256GB NVMe',pantalla:'14" FHD'},notas:'Disponible para reasignación.'},
    {tipo:'Desktop',marca:'HP',modelo:'ProDesk 600 G9',sn:'SN-2024-DT-0001',codigoInterno:'INV-DT-001',estado:'activo',ubicacion:'Finanzas',responsable:'Sofía Méndez',proveedor:'HP Inc.',factura:'FAC-2024-0178',costo:12400,fechaAdquisicion:'2024-01-30',fechaGarantia:'2027-01-30',vidaUtil:5,especificaciones:{cpu:'Intel Core i5-13500',ram:'16GB DDR5',ssd:'512GB NVMe'},notas:''},
    {tipo:'Desktop',marca:'Dell',modelo:'OptiPlex 7010',sn:'SN-2024-DT-0002',codigoInterno:'INV-DT-002',estado:'activo',ubicacion:'Recursos humanos',responsable:'Pedro Castillo',proveedor:'Dell Technologies',factura:'FAC-2024-0099',costo:13200,fechaAdquisicion:'2024-02-10',fechaGarantia:'2027-02-10',vidaUtil:5,especificaciones:{cpu:'Intel Core i7-13700',ram:'16GB DDR5',ssd:'512GB NVMe'},notas:''},
    {tipo:'Desktop',marca:'Lenovo',modelo:'ThinkCentre M90a',sn:'SN-2023-DT-0003',codigoInterno:'INV-DT-003',estado:'baja',ubicacion:'Almacén',responsable:'—',proveedor:'Lenovo Argentina',factura:'FAC-2021-0455',costo:11800,fechaAdquisicion:'2021-06-15',fechaGarantia:'2024-06-15',vidaUtil:5,especificaciones:{cpu:'Intel Core i5-10400',ram:'8GB DDR4',ssd:'256GB SATA'},notas:'Dado de baja por obsolescencia.'},
    {tipo:'Monitor',marca:'Dell',modelo:'P2422H',sn:'SN-2024-MN-0001',codigoInterno:'INV-MN-001',estado:'activo',ubicacion:'Ingeniería',responsable:'María García',proveedor:'Dell Technologies',factura:'FAC-2024-0143',costo:3400,fechaAdquisicion:'2024-01-10',fechaGarantia:'2027-01-10',vidaUtil:7,especificaciones:{pantalla:'24" FHD 1920x1080',panel:'IPS',conectividad:'HDMI, DisplayPort, USB-C'},notas:''},
    {tipo:'Monitor',marca:'Dell',modelo:'U2723QE',sn:'SN-2024-MN-0002',codigoInterno:'INV-MN-002',estado:'activo',ubicacion:'Ingeniería',responsable:'Carlos Pérez',proveedor:'Dell Technologies',factura:'FAC-2024-0201',costo:6800,fechaAdquisicion:'2024-02-05',fechaGarantia:'2027-02-05',vidaUtil:7,especificaciones:{pantalla:'27" 4K UHD 3840x2160',panel:'IPS Black',conectividad:'HDMI, DisplayPort, USB-C 90W'},notas:''},
    {tipo:'Monitor',marca:'Samsung',modelo:'S27A800',sn:'SN-2024-MN-0003',codigoInterno:'INV-MN-003',estado:'activo',ubicacion:'Finanzas',responsable:'Sofía Méndez',proveedor:'Samsung Argentina',factura:'FAC-2024-0288',costo:5200,fechaAdquisicion:'2024-02-20',fechaGarantia:'2026-02-20',vidaUtil:7,especificaciones:{pantalla:'27" QHD 2560x1440',panel:'IPS',conectividad:'HDMI, DisplayPort'},notas:''},
    {tipo:'Monitor',marca:'LG',modelo:'24MP400-B',sn:'SN-2023-MN-0004',codigoInterno:'INV-MN-004',estado:'prestamo',ubicacion:'Cartera y cobro',responsable:'Laura Díaz',proveedor:'LG Electronics',factura:'FAC-2023-0512',costo:2800,fechaAdquisicion:'2023-07-01',fechaGarantia:'2025-07-01',vidaUtil:7,especificaciones:{pantalla:'24" FHD 1920x1080',panel:'IPS',conectividad:'HDMI, VGA'},notas:'En préstamo al área de Cartera y cobro.'},
    {tipo:'Impresora',marca:'HP',modelo:'LaserJet Pro M404',sn:'SN-2024-IM-0001',codigoInterno:'INV-IM-001',estado:'activo',ubicacion:'Administración',responsable:'Laura Díaz',proveedor:'HP Inc.',factura:'FAC-2024-0067',costo:6800,fechaAdquisicion:'2024-01-18',fechaGarantia:'2026-01-18',vidaUtil:7,especificaciones:{tipo:'Láser monocromo',velocidad:'40 ppm',resolucion:'1200x1200 dpi',conectividad:'USB, Ethernet'},notas:'Mantenimiento correctivo reciente.'},
    {tipo:'Impresora',marca:'Brother',modelo:'MFC-L8900CDW',sn:'SN-2024-IM-0002',codigoInterno:'INV-IM-002',estado:'activo',ubicacion:'Ingeniería',responsable:'Carlos López',proveedor:'Brother LATAM',factura:'FAC-2024-0312',costo:12400,fechaAdquisicion:'2024-03-01',fechaGarantia:'2027-03-01',vidaUtil:7,especificaciones:{tipo:'Láser color',velocidad:'33 ppm',resolucion:'2400x600 dpi',conectividad:'USB, Ethernet, Wi-Fi'},notas:''},
    {tipo:'Servidor',marca:'Dell',modelo:'PowerEdge R750',sn:'SN-2024-SR-0001',codigoInterno:'INV-SR-001',estado:'activo',ubicacion:'Ingeniería',responsable:'Carlos López',proveedor:'Dell Technologies',factura:'FAC-2024-0001',costo:185000,fechaAdquisicion:'2024-01-05',fechaGarantia:'2029-01-05',vidaUtil:8,especificaciones:{cpu:'2x Intel Xeon Silver 4314',ram:'128GB DDR4 ECC',almacenamiento:'4x 2TB NVMe RAID 10',red:'2x 10GbE'},notas:'Servidor principal de aplicaciones.'},
    {tipo:'Switch',marca:'Cisco',modelo:'Catalyst 9300',sn:'SN-2024-SW-0001',codigoInterno:'INV-SW-001',estado:'activo',ubicacion:'Ingeniería',responsable:'Carlos López',proveedor:'Cisco Systems',factura:'FAC-2024-0007',costo:48600,fechaAdquisicion:'2024-01-08',fechaGarantia:'2029-01-08',vidaUtil:10,especificaciones:{puertos:'48x 1GbE + 4x 10GbE',stacking:'StackWise-480',poe:'PoE+ 740W'},notas:'Core de red principal.'},
    {tipo:'Router',marca:'Cisco',modelo:'ISR 4331',sn:'SN-2023-RT-0001',codigoInterno:'INV-RT-001',estado:'almacen',ubicacion:'Almacén',responsable:'—',proveedor:'Cisco Systems',factura:'FAC-2023-0312',costo:32000,fechaAdquisicion:'2023-05-20',fechaGarantia:'2026-05-20',vidaUtil:8,especificaciones:{cpu:'Multi-core 2.1GHz',interfaces:'3x WAN, 2x LAN',throughput:'300 Mbps'},notas:'Backup de router principal.'},
    {tipo:'UPS',marca:'APC',modelo:'Smart-UPS 1500VA',sn:'SN-2024-UPS-0001',codigoInterno:'INV-UPS-001',estado:'activo',ubicacion:'Ingeniería',responsable:'Carlos López',proveedor:'Schneider Electric',factura:'FAC-2024-0045',costo:8900,fechaAdquisicion:'2024-01-12',fechaGarantia:'2027-01-12',vidaUtil:6,especificaciones:{capacidad:'1500VA / 1000W',salidas:'8x NEMA 5-15R',tecnologia:'Line-Interactive'},notas:'Protección del servidor principal.'},
  ]

  for (const eq of equiposData) {
    const existing = await prisma.equipo.findUnique({ where: { sn: eq.sn } })
    if (!existing) {
      const creado = await prisma.equipo.create({
        data: {
          ...eq,
          especificaciones: eq.especificaciones ? JSON.stringify(eq.especificaciones) : null,
        }
      })

      // Movimientos para el primer equipo
      if (eq.sn === 'SN-2024-LP-0001') {
        await prisma.movimiento.createMany({
          data: [
            { equipoId: creado.id, tipo:'asignacion', titulo:'Asignación a María García', fecha:'2024-01-15', descripcion:'Entrega inicial al departamento de Sistemas', responsable:'Carlos López' },
            { equipoId: creado.id, tipo:'transferencia', titulo:'Transferencia de Piso 1 a Piso 2', fecha:'2024-06-20', descripcion:'Cambio de oficina por reestructuración organizativa', responsable:'María García' },
            { equipoId: creado.id, tipo:'reparacion', titulo:'Envío a reparación', fecha:'2024-09-10', descripcion:'Teclado con teclas sueltas, reemplazo necesario bajo garantía', responsable:'Ana Martínez' },
            { equipoId: creado.id, tipo:'retorno', titulo:'Retorno de reparación', fecha:'2024-09-18', descripcion:'Teclado reemplazado, funcionamiento verificado por técnico', responsable:'Ana Martínez' },
          ]
        })
        await prisma.mantenimiento.create({
          data: { equipoId: creado.id, tipo:'Preventivo', descripcion:'Limpieza general, actualización de BIOS, verificación de SSD', fechaProgramada:'2024-03-15', fechaEjecucion:'2024-03-15', tecnico:'Carlos López', estado:'Completado', costo:0 }
        })
      }

      // Mantenimiento para el servidor
      if (eq.sn === 'SN-2024-SR-0001') {
        await prisma.mantenimiento.create({
          data: { equipoId: creado.id, tipo:'Preventivo', descripcion:'Limpieza de filtros, revisión de ventiladores, actualización de firmware iDRAC', fechaProgramada:'2025-02-01', fechaEjecucion:null, tecnico:'Carlos López', estado:'Pendiente', costo:0 }
        })
      }

      // Mantenimiento para la impresora HP
      if (eq.sn === 'SN-2024-IM-0001') {
        await prisma.mantenimiento.create({
          data: { equipoId: creado.id, tipo:'Correctivo', descripcion:'Reemplazo de fuser unit y calibración de bandeja', fechaProgramada:'2024-09-10', fechaEjecucion:'2024-09-12', tecnico:'Ana Martínez', estado:'Completado', costo:85 }
        })
      }

      // Mantenimiento para la laptop HP (reparacion)
      if (eq.sn === 'SN-2024-LP-0003') {
        await prisma.mantenimiento.create({
          data: { equipoId: creado.id, tipo:'Correctivo', descripcion:'Reemplazo de teclado completo y revisión de hinges', fechaProgramada:'2025-01-12', fechaEjecucion:null, tecnico:'Ana Martínez', estado:'En proceso', costo:120 }
        })
      }
    }
  }

  console.log(`✅ ${equiposData.length} equipos creados con movimientos y mantenimientos`)
  console.log('🎉 Seed completado!')
  console.log('')
  console.log('Credenciales de acceso:')
  console.log('  Admin:    ADMIN / admin123')
  console.log('  Técnico:  TECNICO / tecnico123')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
