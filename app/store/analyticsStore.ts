/**
 * Analytics Store
 * Manages play tracking and analytics for music playback
 */

import { create } from 'zustand'

/**
 * Play attempt tracking for accurate play count analytics
 * Ensures we only count plays after 30s and avoid duplicates
 */
export interface PlayAttempt {
  startedAt: number // timestamp when playback started
  reported: boolean // whether this play has been reported
}

/**
 * State for analytics and play tracking
 */
export interface AnalyticsState {
  // Play tracking
  playAttempts: Map<number, PlayAttempt>
  playCountIncremented: boolean // legacy compat

  // Actions
  startPlayAttempt: (songId: number) => void
  reportPlay: (songId: number) => Promise<void>
  setPlayCountIncremented: (incremented: boolean) => void
  clearPlayAttempt: (songId: number) => void
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  // Initial state
  playAttempts: new Map(),
  playCountIncremented: false,

  // Actions
  startPlayAttempt: (songId: number) => {
    const state = get()
    const attempts = new Map(state.playAttempts)
    attempts.set(songId, {
      startedAt: Date.now(),
      reported: false,
    })
    set({ playAttempts: attempts })
  },

  reportPlay: async (songId: number) => {
    const state = get()
    const attempt = state.playAttempts.get(songId)

    if (!attempt || attempt.reported) return

    // Mark as reported immediately to prevent double-counting
    const attempts = new Map(state.playAttempts)
    attempts.set(songId, { ...attempt, reported: true })
    set({ playAttempts: attempts })

    // Frontend-only play count tracking (no backend call)
    // Store play counts in localStorage
    try {
      const playCountsKey = 'muza-play-counts'
      const storedCounts = localStorage.getItem(playCountsKey)
      const playCounts: Record<number, number> = storedCounts ? JSON.parse(storedCounts) : {}

      // Increment play count for this track
      playCounts[songId] = (playCounts[songId] || 0) + 1

      // Save back to localStorage
      localStorage.setItem(playCountsKey, JSON.stringify(playCounts))
    } catch {
      // Silently fail if localStorage is unavailable
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

