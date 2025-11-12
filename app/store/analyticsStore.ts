import { create } from 'zustand'

export interface PlayAttempt {
  startedAt: number
  reported: boolean
}

export interface AnalyticsState {
  playAttempts: Map<number, PlayAttempt>
  playCountIncremented: boolean

  startPlayAttempt: (songId: number) => void
  reportPlay: (songId: number) => Promise<void>
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

  reportPlay: async (songId: number) => {
    const state = get()
    const attempt = state.playAttempts.get(songId)

    if (!attempt || attempt.reported) return

    const attempts = new Map(state.playAttempts)
    attempts.set(songId, { ...attempt, reported: true })
    set({ playAttempts: attempts })

    try {
      const playCountsKey = 'muza-play-counts'
      const storedCounts = localStorage.getItem(playCountsKey)
      const playCounts: Record<number, number> = storedCounts ? JSON.parse(storedCounts) : {}

      playCounts[songId] = (playCounts[songId] || 0) + 1

      localStorage.setItem(playCountsKey, JSON.stringify(playCounts))
    } catch {
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

