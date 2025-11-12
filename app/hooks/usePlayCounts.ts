import { useEffect, useState } from 'react'

const PLAY_COUNTS_KEY = 'muza-play-counts'

export function getPlayCounts(): Record<number, number> {
  if (typeof window === 'undefined') return {}
  
  try {
    const stored = localStorage.getItem(PLAY_COUNTS_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

export function getPlayCount(trackId: number): number {
  const counts = getPlayCounts()
  return counts[trackId] || 0
}

export function usePlayCount(trackId: number): number {
  const [playCount, setPlayCount] = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined') return

    setPlayCount(getPlayCount(trackId))

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === PLAY_COUNTS_KEY) {
        setPlayCount(getPlayCount(trackId))
      }
    }

    window.addEventListener('storage', handleStorageChange)

    const interval = setInterval(() => {
      setPlayCount(getPlayCount(trackId))
    }, 1000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [trackId])

  return playCount
}

export function usePlayCounts(): Record<number, number> {
  const [playCounts, setPlayCounts] = useState<Record<number, number>>({})

  useEffect(() => {
    if (typeof window === 'undefined') return

    setPlayCounts(getPlayCounts())

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === PLAY_COUNTS_KEY) {
        setPlayCounts(getPlayCounts())
      }
    }

    window.addEventListener('storage', handleStorageChange)

    const interval = setInterval(() => {
      setPlayCounts(getPlayCounts())
    }, 1000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  return playCounts
}

export function getCombinedPlayCount(trackId: number, initialPlays: number = 0): number {
  const localIncrement = getPlayCount(trackId)
  return initialPlays + localIncrement
}

export function resetPlayCounts(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(PLAY_COUNTS_KEY)
  } catch {
  }
}

export function resetPlayCount(trackId: number): void {
  if (typeof window === 'undefined') return
  
  try {
    const counts = getPlayCounts()
    delete counts[trackId]
    localStorage.setItem(PLAY_COUNTS_KEY, JSON.stringify(counts))
  } catch {
  }
}

