import type { CSSProperties } from 'react'

// Tokens visuales compartidos por TODOS los módulos (no solo Servicios).
// Cambiar un valor aquí lo cambia en Cursos, Eventos, Directorio, etc. a la vez.

export const COLOR_MARCA = '#B66878'
export const COLOR_MARCA_CLARO = '#EFC3CA'
export const COLOR_BORDE = '#f3f4f6'

export const CARD_SHADOW_REST = '0 1px 4px rgba(0,0,0,0.06)'
export const CARD_SHADOW_HOVER = '0 4px 20px rgba(0,0,0,0.1)'

export const badgePillStyle = (bg: string, color: string): CSSProperties => ({
  display: 'inline-block',
  padding: '4px 12px',
  borderRadius: '20px',
  fontSize: '12px',
  fontWeight: '600',
  background: bg,
  color,
})

export const botonPrimario: CSSProperties = {
  background: COLOR_MARCA, color: 'white', padding: '12px 24px',
  borderRadius: '10px', border: 'none', cursor: 'pointer',
  fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px',
}

export const paginacionBotonStyle = (activo: boolean, deshabilitado: boolean): CSSProperties => ({
  minWidth: '34px', height: '34px', padding: '0 10px', borderRadius: '9px',
  border: activo ? `1px solid ${COLOR_MARCA}` : '1px solid #e5e7eb',
  background: activo ? COLOR_MARCA : 'white',
  color: deshabilitado ? '#d1d5db' : activo ? 'white' : '#374151',
  fontWeight: '700', fontSize: '13px',
  cursor: deshabilitado ? 'not-allowed' : 'pointer',
})
