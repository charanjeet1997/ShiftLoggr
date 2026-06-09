import { useCallback, useEffect, useState } from 'react'
import type { SwapRequest } from '../types'
import * as swapsApi from '../api/swaps'
import { errorMessage } from '../api/client'

export function useSwaps() {
  const [swaps, setSwaps] = useState<SwapRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setSwaps(await swapsApi.getSwaps())
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { swaps, loading, error, refresh }
}
