import { useCallback, useEffect, useState } from 'react'
import type { Shift } from '../types'
import * as shiftsApi from '../api/shifts'
import { errorMessage } from '../api/client'

export function useShifts() {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setShifts(await shiftsApi.getShifts())
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { shifts, loading, error, refresh, setShifts }
}
