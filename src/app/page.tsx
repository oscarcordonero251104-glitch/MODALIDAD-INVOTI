'use client'

import { useEffect } from 'react'

export default function Home() {
  useEffect(() => {
    window.location.replace('/invtec.html#/login')
  }, [])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#030810',
        color: '#94a3b8',
        fontFamily: 'monospace',
        fontSize: '13px',
        letterSpacing: '0.1em',
      }}
    >
      <span>CARGANDO INV-OTI…</span>
    </div>
  )
}
