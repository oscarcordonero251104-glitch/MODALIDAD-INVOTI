import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import ExcelJS from 'exceljs'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

function calcDepreciacion(costo: number, vidaUtil: number, fechaAdquisicion: string | null) {
  if (!costo || !vidaUtil || !fechaAdquisicion) return { valorLibros: costo || 0, depreciacion: 0, porcentaje: 0 }
  const adq = new Date(fechaAdquisicion)
  const now = new Date()
  const mesesTranscurridos = (now.getFullYear() - adq.getFullYear()) * 12 + (now.getMonth() - adq.getMonth())
  const mesesVida = vidaUtil * 12
  const depreciacionAnual = costo / vidaUtil
  const depreciacionMensual = depreciacionAnual / 12
  const depreciacionTotal = Math.min(costo, depreciacionMensual * mesesTranscurridos)
  const valorLibros = Math.max(0, costo - depreciacionTotal)
  const porcentaje = Math.min(100, (mesesTranscurridos / mesesVida) * 100)
  return { valorLibros: Math.round(valorLibros * 100) / 100, depreciacion: Math.round(depreciacionTotal * 100) / 100, porcentaje: Math.round(porcentaje * 100) / 100 }
}

const estadoLabels: Record<string, string> = { activo: 'Activo', reparacion: 'En reparación', baja: 'Dado de baja', almacen: 'En almacén', prestamo: 'En préstamo' }

const monedaSymbol = (m: string | null | undefined) => (m === 'USD' ? '$' : 'C$')
const money = (n: number, m: string | null | undefined) => monedaSymbol(m) + (n || 0).toLocaleString('es-AR')
function sumaPorMoneda(equipos: any[]): Record<string, number> {
  const sums: Record<string, number> = {}
  for (const eq of equipos) {
    const m = eq.moneda || 'NIO'
    sums[m] = (sums[m] || 0) + (eq.costo || 0)
  }
  return sums
}

export async function GET(request: Request) {
  try {
    requireAuth(request)
    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get('tipo') || 'inventario'
    const formato = (searchParams.get('formato') || 'excel').toLowerCase()
    const isExcel = formato === 'excel' || formato === 'xlsx'

    const equipos = await db.equipo.findMany({ orderBy: { createdAt: 'desc' } })

    if (tipo === 'inventario') {
      if (isExcel) {
        const buffer = await generarExcelInventario(equipos)
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename="inventario_completo.xlsx"',
          },
        })
      } else {
        const buffer = await generarPDFInventario(equipos)
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="inventario_completo.pdf"',
          },
        })
      }
    }

    if (tipo === 'estado') {
      if (isExcel) {
        const buffer = await generarExcelPorEstado(equipos)
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename="equipos_por_estado.xlsx"',
          },
        })
      } else {
        const buffer = await generarPDFPorEstado(equipos)
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="equipos_por_estado.pdf"',
          },
        })
      }
    }

    if (tipo === 'depreciacion') {
      if (isExcel) {
        const buffer = await generarExcelDepreciacion(equipos)
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename="reporte_depreciacion.xlsx"',
          },
        })
      } else {
        const buffer = await generarPDFDepreciacion(equipos)
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="reporte_depreciacion.pdf"',
          },
        })
      }
    }

    return NextResponse.json({ error: 'Tipo de reporte no válido' }, { status: 400 })
  } catch (error) {
    if (error instanceof Response) return error
    console.error('GET /api/reportes error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

async function generarExcelInventario(equipos: any[]): Promise<Buffer> {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'INV-OTI'
  wb.created = new Date()
  const ws = wb.addWorksheet('Inventario Completo')

  ws.columns = [
    { header: 'Código', key: 'codigo', width: 15 },
    { header: 'Tipo', key: 'tipo', width: 14 },
    { header: 'Marca', key: 'marca', width: 14 },
    { header: 'Modelo', key: 'modelo', width: 28 },
    { header: 'N° Serie', key: 'sn', width: 22 },
    { header: 'Estado', key: 'estado', width: 14 },
    { header: 'Ubicación', key: 'ubicacion', width: 22 },
    { header: 'Responsable', key: 'responsable', width: 20 },
    { header: 'Proveedor', key: 'proveedor', width: 20 },
    { header: 'Factura', key: 'factura', width: 16 },
    { header: 'Costo', key: 'costo', width: 14 },
    { header: 'Moneda', key: 'moneda', width: 10 },
    { header: 'F. Adquisición', key: 'fechaAdq', width: 16 },
    { header: 'F. Garantía', key: 'fechaGar', width: 16 },
    { header: 'Vida Útil', key: 'vidaUtil', width: 12 },
    { header: 'Notas', key: 'notas', width: 30 },
  ]

  const headerRow = ws.getRow(1)
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } }
  headerRow.alignment = { horizontal: 'center' }

  for (const eq of equipos) {
    ws.addRow({
      codigo: eq.codigoInterno || '—',
      tipo: eq.tipo,
      marca: eq.marca,
      modelo: eq.modelo,
      sn: eq.sn,
      estado: estadoLabels[eq.estado] || eq.estado,
      ubicacion: eq.ubicacion || '—',
      responsable: eq.responsable || '—',
      proveedor: eq.proveedor || '—',
      factura: eq.factura || '—',
      costo: eq.costo || 0,
      moneda: eq.moneda || 'NIO',
      fechaAdq: eq.fechaAdquisicion || '—',
      fechaGar: eq.fechaGarantia || '—',
      vidaUtil: eq.vidaUtil ? eq.vidaUtil + ' años' : '—',
      notas: eq.notas || '',
    })
  }

  const buffer = await wb.xlsx.writeBuffer()
  return new Uint8Array(buffer)
}

async function generarPDFInventario(equipos: any[]): Promise<Buffer> {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  doc.setFontSize(16)
  doc.text('INV-OTI — Inventario Completo de Equipos', 14, 15)
  doc.setFontSize(9)
  doc.text(`Generado: ${new Date().toLocaleDateString('es-AR')} | Total: ${equipos.length} equipos`, 14, 22)

  const rows = equipos.map(eq => [
    eq.codigoInterno || '—',
    eq.tipo,
    eq.marca + ' ' + eq.modelo,
    eq.sn,
    estadoLabels[eq.estado] || eq.estado,
    eq.ubicacion || '—',
    eq.responsable || '—',
    money(eq.costo, eq.moneda),
  ])

  autoTable(doc, {
    startY: 28,
    head: [['Código', 'Tipo', 'Marca/Modelo', 'S/N', 'Estado', 'Ubicación', 'Responsable', 'Costo']],
    body: rows,
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [37, 99, 235], textColor: 255 },
    alternateRowStyles: { fillColor: [243, 244, 246] },
    margin: { left: 14, right: 14 },
  })

  const buffer = Buffer.from(doc.output('arraybuffer'))
  return buffer
}

async function generarExcelPorEstado(equipos: any[]): Promise<Buffer> {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'INV-OTI'
  const ws = wb.addWorksheet('Equipos por Estado')

  const agrupados: Record<string, any[]> = {}
  for (const eq of equipos) {
    const est = eq.estado || 'sin_estado'
    if (!agrupados[est]) agrupados[est] = []
    agrupados[est].push(eq)
  }

  ws.columns = [
    { header: 'Estado', key: 'estado', width: 16 },
    { header: 'Cantidad', key: 'cantidad', width: 12 },
    { header: 'Costo Total (NIO)', key: 'costoTotalNio', width: 18 },
    { header: 'Costo Total (USD)', key: 'costoTotalUsd', width: 18 },
  ]

  const headerRow = ws.getRow(1)
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } }

  const summaryWs = wb.addWorksheet('Detalle por Estado')
  summaryWs.columns = [
    { header: 'Código', key: 'codigo', width: 15 },
    { header: 'Tipo', key: 'tipo', width: 14 },
    { header: 'Marca', key: 'marca', width: 14 },
    { header: 'Modelo', key: 'modelo', width: 28 },
    { header: 'S/N', key: 'sn', width: 22 },
    { header: 'Estado', key: 'estado', width: 14 },
    { header: 'Ubicación', key: 'ubicacion', width: 24 },
    { header: 'Responsable', key: 'responsable', width: 20 },
    { header: 'Costo', key: 'costo', width: 14 },
    { header: 'Moneda', key: 'moneda', width: 10 },
  ]

  const detailHeader = summaryWs.getRow(1)
  detailHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  detailHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } }

  for (const [estado, eqs] of Object.entries(agrupados)) {
    const sums = sumaPorMoneda(eqs)
    ws.addRow({ estado: estadoLabels[estado] || estado, cantidad: eqs.length, costoTotalNio: sums.NIO || 0, costoTotalUsd: sums.USD || 0 })
    for (const eq of eqs) {
      summaryWs.addRow({
        codigo: eq.codigoInterno || '—',
        tipo: eq.tipo,
        marca: eq.marca,
        modelo: eq.modelo,
        sn: eq.sn,
        estado: estadoLabels[eq.estado] || eq.estado,
        ubicacion: eq.ubicacion || '—',
        responsable: eq.responsable || '—',
        costo: eq.costo || 0,
        moneda: eq.moneda || 'NIO',
      })
    }
  }

  const buffer = await wb.xlsx.writeBuffer()
  return new Uint8Array(buffer)
}

async function generarPDFPorEstado(equipos: any[]): Promise<Buffer> {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  doc.setFontSize(16)
  doc.text('INV-OTI — Equipos por Estado', 14, 15)

  const agrupados: Record<string, any[]> = {}
  for (const eq of equipos) {
    const est = eq.estado || 'sin_estado'
    if (!agrupados[est]) agrupados[est] = []
    agrupados[est].push(eq)
  }

  let y = 25
  for (const [estado, eqs] of Object.entries(agrupados)) {
    doc.setFontSize(11)
    doc.setFont(undefined!, 'bold')
    doc.text(`${estadoLabels[estado] || estado} (${eqs.length})`, 14, y)
    y += 2

    const rows = eqs.map(eq => [
      eq.codigoInterno || '—',
      eq.tipo + ' ' + eq.marca + ' ' + eq.modelo,
      eq.sn,
      eq.responsable || '—',
      money(eq.costo, eq.moneda),
    ])

    autoTable(doc, {
      startY: y,
      head: [['Código', 'Equipo', 'S/N', 'Responsable', 'Costo']],
      body: rows,
      styles: { fontSize: 7, cellPadding: 1.5 },
      headStyles: { fillColor: [37, 99, 235], textColor: 255 },
      margin: { left: 14, right: 14 },
    })

    y = (doc as any).lastAutoTable.finalY + 8

    if (y > 180) {
      doc.addPage()
      y = 15
    }
  }

  const buffer = Buffer.from(doc.output('arraybuffer'))
  return buffer
}

async function generarExcelDepreciacion(equipos: any[]): Promise<Buffer> {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'INV-OTI'
  const ws = wb.addWorksheet('Depreciación')

  ws.columns = [
    { header: 'Código', key: 'codigo', width: 15 },
    { header: 'Equipo', key: 'equipo', width: 32 },
    { header: 'S/N', key: 'sn', width: 22 },
    { header: 'Costo Original', key: 'costo', width: 16 },
    { header: 'Moneda', key: 'moneda', width: 10 },
    { header: 'F. Adquisición', key: 'fechaAdq', width: 16 },
    { header: 'Vida Útil', key: 'vidaUtil', width: 12 },
    { header: 'Depreciación', key: 'depreciacion', width: 16 },
    { header: 'Valor en Libros', key: 'valorLibros', width: 16 },
    { header: '% Depreciado', key: 'porcentaje', width: 14 },
  ]

  const headerRow = ws.getRow(1)
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } }

  const totales: Record<string, { costo: number; depr: number; libros: number }> = {}

  for (const eq of equipos) {
    const dep = calcDepreciacion(eq.costo, eq.vidaUtil, eq.fechaAdquisicion)
    const m = eq.moneda || 'NIO'
    if (!totales[m]) totales[m] = { costo: 0, depr: 0, libros: 0 }
    totales[m].costo += eq.costo || 0
    totales[m].depr += dep.depreciacion
    totales[m].libros += dep.valorLibros
    ws.addRow({
      codigo: eq.codigoInterno || '—',
      equipo: eq.tipo + ' ' + eq.marca + ' ' + eq.modelo,
      sn: eq.sn,
      costo: eq.costo || 0,
      moneda: m,
      fechaAdq: eq.fechaAdquisicion || '—',
      vidaUtil: eq.vidaUtil ? eq.vidaUtil + ' años' : '—',
      depreciacion: dep.depreciacion,
      valorLibros: dep.valorLibros,
      porcentaje: dep.porcentaje + '%',
    })
  }

  for (const [m, t] of Object.entries(totales)) {
    const totalRow = ws.addRow({
      codigo: '',
      equipo: 'TOTALES (' + m + ')',
      sn: '',
      costo: t.costo,
      moneda: m,
      fechaAdq: '',
      vidaUtil: '',
      depreciacion: t.depr,
      valorLibros: t.libros,
      porcentaje: '',
    })
    totalRow.font = { bold: true }
    totalRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } }
  }

  const buffer = await wb.xlsx.writeBuffer()
  return new Uint8Array(buffer)
}

async function generarPDFDepreciacion(equipos: any[]): Promise<Buffer> {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  doc.setFontSize(16)
  doc.text('INV-OTI — Reporte de Depreciación', 14, 15)
  doc.setFontSize(9)
  doc.text(`Generado: ${new Date().toLocaleDateString('es-AR')}`, 14, 22)

  const rows = equipos.map(eq => {
    const dep = calcDepreciacion(eq.costo, eq.vidaUtil, eq.fechaAdquisicion)
    return [
      eq.codigoInterno || '—',
      eq.tipo + ' ' + eq.marca + ' ' + eq.modelo,
      eq.sn,
      money(eq.costo, eq.moneda),
      eq.fechaAdquisicion || '—',
      (eq.vidaUtil || 0) + ' años',
      money(dep.depreciacion, eq.moneda),
      money(dep.valorLibros, eq.moneda),
      dep.porcentaje + '%',
    ]
  })

  autoTable(doc, {
    startY: 28,
    head: [['Código', 'Equipo', 'S/N', 'Costo Original', 'F. Adquisición', 'Vida Útil', 'Depreciación', 'Valor Libros', '% Deprec.']],
    body: rows,
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [37, 99, 235], textColor: 255 },
    alternateRowStyles: { fillColor: [243, 244, 246] },
    margin: { left: 14, right: 14 },
  })

  const buffer = Buffer.from(doc.output('arraybuffer'))
  return buffer
}
