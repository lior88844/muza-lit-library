/**
 * Hook for accessing and managing play counts stored in localStorage
 * This is a frontend-only solution until the backend is implemented
 */

import { useEffect, useState } from 'react'

const PLAY_COUNTS_KEY = 'muza-play-counts'

/**
 * Get all play counts from localStorage
 */
export function getPlayCounts(): Record<number, number> {
  if (typeof window === 'undefined') return {}
  
  try {
    const stored = localStorage.getItem(PLAY_COUNTS_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

/**
 * Get play count for a specific track
 */
export function getPlayCount(trackId: number): number {
  const counts = getPlayCounts()
  return counts[trackId] || 0
}

/**
 * Hook to get play count for a specific track with real-time updates
 * Re-renders when play counts change in localStorage
 * SSR-safe: returns 0 on server, hydrates on client
 */
export function usePlayCount(trackId: number): number {
  const [playCount, setPlayCount] = useState(0)

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    // Initial load
    setPlayCount(getPlayCount(trackId))

    // Listen for storage changes (updates from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === PLAY_COUNTS_KEY) {
        setPlayCount(getPlayCount(trackId))
      }
    }

    window.addEventListener('storage', handleStorageChange)

    // Poll for changes (since localStorage events don't fire in the same tab)
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

/**
 * Hook to get all play counts with real-time updates
 * SSR-safe: returns empty object on server, hydrates on client
 */
export function usePlayCounts(): Record<number, number> {
  const [playCounts, setPlayCounts] = useState<Record<number, number>>({})

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    // Initial load
    setPlayCounts(getPlayCounts())

    // Listen for storage changes (updates from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === PLAY_COUNTS_KEY) {
        setPlayCounts(getPlayCounts())
      }
    }

    window.addEventListener('storage', handleStorageChange)

    // Poll for changes (since localStorage events don't fire in the same tab)
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

/**
 * Get combined play count (mock data + localStorage increments)
 * This merges the initial play count from mock data with frontend increments
 */
export function getCombinedPlayCount(trackId: number, initialPlays: number = 0): number {
  const localIncrement = getPlayCount(trackId)
  return initialPlays + localIncrement
}

/**
 * Reset all play counts in localStorage
 * Useful for testing/debugging
 */
export function resetPlayCounts(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(PLAY_COUNTS_KEY)
  } catch {
    // Silently fail
  }
}

/**
 * Reset play count for a specific track
 * Useful for testing/debugging
 */
export function resetPlayCount(trackId: number): void {
  if (typeof window === 'undefined') return
  
  try {
    const counts = getPlayCounts()
    delete counts[trackId]
    localStorage.setItem(PLAY_COUNTS_KEY, JSON.stringify(counts))
  } catch {
    // Silently fail
  }
}

