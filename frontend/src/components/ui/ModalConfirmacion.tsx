import { COLOR_MARCA, COLOR_BORDE } from '../../styles/tokens'
import { AlertTriangle } from 'lucide-react'

interface ModalConfirmacionProps {
  abierto: boolean
  titulo: string
  mensaje: string
  textoConfirmar?: string
  textoCancelar?: string
  cargando?: boolean
  variante?: 'default' | 'peligro'
  onConfirmar: () => void
  onCancelar: () => void
}

/**
 * Modal de confirmación genérico. Reemplaza window.confirm() (que se ve
 * como un popup del sistema operativo, fuera de nuestro diseño) por algo
 * consistente con el resto de la app.
 *
 * Uso típico:
 *   const [modalAbierto, setModalAbierto] = useState(false)
 *   const [idPendiente, setIdPendiente] = useState<number | null>(null)
 *
 *   const pedirConfirmacion = (id: number) => {
 *     setIdPendiente(id)
 *     setModalAbierto(true)
 *   }
 *
 *   const confirmar = async () => {
 *     if (idPendiente == null) return
 *     await cerrarOportunidad(idPendiente)
 *     setModalAbierto(false)
 *   }
 *
 *   <ModalConfirmacion
 *     abierto={modalAbierto}
 *     titulo="¿Cerrar esta oportunidad?"
 *     mensaje="Ya no aceptará nuevas postulaciones. Esta acción no se puede deshacer."
 *     variante="peligro"
 *     onConfirmar={confirmar}
 *     onCancelar={() => setModalAbierto(false)}
 *   />
 */
export default function ModalConfirmacion({
  abierto,
  titulo,
  mensaje,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  cargando = false,
  variante = 'default',
  onConfirmar,
  onCancelar,
}: ModalConfirmacionProps) {
  if (!abierto) return null

  const colorAccion = variante === 'peligro' ? '#dc2626' : COLOR_MARCA
  const bgAccion = variante === 'peligro' ? '#fef2f2' : '#fdf2f4'
  const borderAccion = variante === 'peligro' ? '#fecaca' : '#f6dde2'

  return (
    <div
      role="presentation"
      onClick={onCancelar}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(17, 24, 39, 0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px', zIndex: 1000,
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="modal-confirmacion-titulo"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white', borderRadius: '16px', padding: '28px',
          maxWidth: '400px', width: '100%',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{
          width: '44px', height: '44px', borderRadius: '50%',
          background: bgAccion, border: `1px solid ${borderAccion}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '16px',
        }}>
          <AlertTriangle size={20} color={colorAccion} />
        </div>

        <h2 id="modal-confirmacion-titulo" style={{
          fontSize: '17px', fontWeight: '800', color: '#111827', margin: '0 0 8px',
        }}>
          {titulo}
        </h2>
        <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.5', margin: '0 0 24px' }}>
          {mensaje}
        </p>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onCancelar}
            disabled={cargando}
            style={{
              flex: 1, padding: '11px', borderRadius: '10px',
              border: `1px solid ${COLOR_BORDE}`, background: 'white', color: '#374151',
              fontWeight: '700', fontSize: '14px', cursor: 'pointer',
              opacity: cargando ? 0.6 : 1,
            }}
          >
            {textoCancelar}
          </button>
          <button
            onClick={onConfirmar}
            disabled={cargando}
            style={{
              flex: 1, padding: '11px', borderRadius: '10px', border: 'none',
              background: colorAccion, color: 'white',
              fontWeight: '700', fontSize: '14px', cursor: 'pointer',
              opacity: cargando ? 0.7 : 1,
            }}
          >
            {cargando ? 'Procesando...' : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  )
}