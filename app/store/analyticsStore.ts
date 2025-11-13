import { create } from 'zustand'

import { apiClient } from '~/lib/apiClient'

export interface PlayAttempt {
  startedAt: number
  reported: boolean
}

export interface AnalyticsState {
  playAttempts: Map<number, PlayAttempt>
  playCountIncremented: boolean

  startPlayAttempt: (songId: number) => void
  reportPlay: (songId: number, duration?: number, completed?: boolean) => Promise<void>
  setPlayCountIncremented: (incremented: boolean) => void
  clearPlayAttempt: (songId: number) => void
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  playAttempts: new Map(),
  playCountIncremented: false,

  startPlayAttempt: (songId: number) => {
    const state = get()
    const attempts = new Map(state.playAttempts)
    attempts.set(songId, {
      startedAt: Date.now(),
      reported: false,
    })
    set({ playAttempts: attempts })
  },

  reportPlay: async (songId: number, duration?: number, completed?: boolean) => {
    const state = get()
    const attempt = state.playAttempts.get(songId)
    const timestamp = attempt?.startedAt || Date.now()

    // If already reported and this is not a completion update, skip
    // Completion updates should always go through to update play history
    if (attempt?.reported && completed !== true) return

    // Mark as reported if this is the initial play (not a completion update)
    if (!attempt?.reported) {
      const attempts = new Map(state.playAttempts)
      attempts.set(songId, { startedAt: timestamp, reported: true })
      set({ playAttempts: attempts })
    }

    try {
      // Call API to record play
      // For completion updates, use the same timestamp but include duration and completed flag
      // The idempotency key ensures play count only increments once
      await apiClient.post('/api/track/record-play', {
        trackId: songId,
        timestamp,
        duration,
        completed: completed ?? false,
      })
    } catch (error) {
      // Log error but don't fail - fallback to localStorage
      console.error('Failed to record play via API:', error)
    }

    // Keep localStorage as cache/fallback (only increment on initial play, not completion)
    if (!attempt?.reported) {
      try {
        const playCountsKey = 'muza-play-counts'
        const storedCounts = localStorage.getItem(playCountsKey)
        const playCounts: Record<number, number> = storedCounts ? JSON.parse(storedCounts) : {}

        playCounts[songId] = (playCounts[songId] || 0) + 1

        localStorage.setItem(playCountsKey, JSON.stringify(playCounts))
      } catch {
        // Ignore localStorage errors - play counts are not critical
      }
    }
  },

  setPlayCountIncremented: (incremented: boolean) => {
    set({ playCountIncremented: incremented })
  },

  clearPlayAttempt: (songId: number) => {
    const state = get()
    const attempts = new Map(state.playAttempts)
    attempts.delete(songId)
    set({ playAttempts: attempts })
  },
}))
