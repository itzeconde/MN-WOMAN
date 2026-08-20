interface Props {
  onReintentar: () => void
  mensaje?: string
}

export default function EstadoSinConexion({ onReintentar, mensaje }: Props) {
  return (
    <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
      <p style={{ fontSize: '16px', marginBottom: '8px', color: '#111827', fontWeight: '600' }}>
        Sin conexión
      </p>
      <p style={{ fontSize: '14px', marginBottom: '16px' }}>
        {mensaje || 'No se pudo cargar la información. Revisa tu internet e intenta de nuevo.'}
      </p>
      <button onClick={onReintentar}
        style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#B66878', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
        Reintentar
      </button>
    </div>
  )
}
