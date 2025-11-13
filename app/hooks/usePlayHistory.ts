import { useEffect, useState } from 'react'

import { apiClient } from '~/lib/apiClient'

export interface PlayHistoryEntry {
  id: number
  userId: string | null
  trackId: number
  playedAt: string
  duration: number | null
  completed: boolean
}

export interface PlayHistoryResponse {
  success: boolean
  history?: PlayHistoryEntry[]
  error?: string
}

export function usePlayHistory(limit: number = 50, offset: number = 0) {
  const [history, setHistory] = useState<PlayHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchHistory() {
      try {
        setLoading(true)
        setError(null)

        const response = await apiClient.get<PlayHistoryResponse>(
          `/api/play-history?limit=${limit}&offset=${offset}`
        )

        if (!cancelled) {
          if (response.data.success && response.data.history) {
            setHistory(response.data.history)
          } else {
            setError(response.data.error || 'Failed to fetch play history')
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch play history')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchHistory()

    return () => {
      cancelled = true
    }
  }, [limit, offset])

  return { history, loading, error }
}
