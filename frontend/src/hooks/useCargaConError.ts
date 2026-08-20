import { useState, useCallback } from 'react'
import { ErrorDeRed } from '../api/axios'

export function useCargaConError() {
  const [cargando, setCargando] = useState(true)
  const [errorRed, setErrorRed] = useState(false)

  const ejecutar = useCallback(async (fn: () => Promise<void>) => {
    setCargando(true)
    setErrorRed(false)
    try {
      await fn()
    } catch (err) {
      if (err instanceof ErrorDeRed) {
        setErrorRed(true)
      }
      console.error(err)
    } finally {
      setCargando(false)
    }
  }, [])

  return { cargando, errorRed, ejecutar, setCargando, setErrorRed }
}
