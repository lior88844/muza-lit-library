import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { NextTrackReason, type PlayerState, type QueueItem, type RepeatMode } from '~/types/player'

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentTrack: null,
      isPlaying: false,
      currentPosition: 0,
      duration: 0,

      volume: 0.75,

      queue: [],
      queueIndex: -1,
      originalQueue: [],

      shuffle: false,
      repeat: 'off',

      source: null,

      selectedSong: null,

      get hasNext() {
        const state = get()
        if (state.repeat === 'one') return true
        if (state.repeat === 'all') return true
        return state.queueIndex + 1 < state.queue.length
      },

      get hasPrev() {
        const state = get()
        if (state.repeat === 'one') return true
        return state.queueIndex > 0
      },

      playQueue: ({ items, startIndex = 0, source }) => {
        if (items.length === 0) return

        const validIndex = Math.max(0, Math.min(startIndex, items.length - 1))

        set({
          queue: items,
          originalQueue: items,
          queueIndex: validIndex,
          currentTrack: items[validIndex],
          selectedSong: items[validIndex],
          isPlaying: true,
          source: source || null,
          currentPosition: 0,
        })
      },

      playPause: (force?: boolean) => {
        const currentState = get().isPlaying
        set({ isPlaying: force !== undefined ? force : !currentState })
      },

      setIsPlaying: (isPlaying: boolean) => {
        set({ isPlaying })
      },

      next: ({ reason }: { reason: NextTrackReason }) => {
        const state = get()
        if (reason === NextTrackReason.TrackEnd && state.repeat === 'one') {
          set({
            currentPosition: 0,
            isPlaying: true,
          })
          return
        }

        let nextIndex = state.queueIndex + 1

        if (nextIndex >= state.queue.length) {
          if (state.repeat === 'all') {
            nextIndex = 0
          } else {
            set({ isPlaying: false })
            return
          }
        }

        if (state.shuffle && nextIndex < state.queue.length) {
          const remaining = state.queue.length - nextIndex
          if (remaining > 1) {
            const randomOffset = Math.floor(Math.random() * remaining)
            nextIndex = nextIndex + randomOffset
          }
        }

        set({
          queueIndex: nextIndex,
          currentTrack: state.queue[nextIndex],
          selectedSong: state.queue[nextIndex],
          isPlaying: true,
          currentPosition: 0,
        })
      },

      prev: () => {
        const state = get()

        if (state.currentPosition > 3) {
          set({
            currentPosition: 0,
            isPlaying: true,
          })
          return
        }

        const prevIndex = state.queueIndex - 1

        set({
          queueIndex: prevIndex,
          currentTrack: state.queue[prevIndex],
          selectedSong: state.queue[prevIndex],
          isPlaying: true,
          currentPosition: 0,
        })
      },

      seekTo: (seconds: number) => {
        set({ currentPosition: Math.max(0, seconds) })
      },

      setCurrentPosition: (seconds: number) => {
        set({ currentPosition: seconds })
      },

      setDuration: (seconds: number) => {
        set({ duration: seconds })
      },

      setVolume: (volume: number) => {
        set({ volume: Math.min(1, Math.max(0, volume)) })
      },

      setRepeat: (mode: RepeatMode) => {
        set({ repeat: mode })
      },

      toggleShuffle: () => {
        const state = get()

        if (state.shuffle) {
          const currentSong = state.currentTrack
          const newIndex = state.originalQueue.findIndex(s => s.id === currentSong?.id)

          set({
            shuffle: false,
            queue: state.originalQueue,
            queueIndex: newIndex >= 0 ? newIndex : 0,
          })
        } else {
          const currentSong = state.currentTrack
          if (!currentSong) return

          const remaining = state.queue.filter(s => s.id !== currentSong.id)
          const shuffled = [currentSong, ...shuffleArray(remaining)]

          set({
            shuffle: true,
            queue: shuffled,
            queueIndex: 0,
          })
        }
      },

      setSelectedSong: (song: QueueItem) => {
        get().playQueue({
          items: [song],
          startIndex: 0,
          source: { type: 'custom', title: song.title },
        })
      },

      togglePlayPause: () => {
        get().playPause()
      },
    }),
    {
      name: 'muza-player-v1',
      storage: createJSONStorage(() => localStorage),

      partialize: state => ({
        current: state.currentTrack,
        queue: state.queue,
        queueIndex: state.queueIndex,
        originalQueue: state.originalQueue,
        shuffle: state.shuffle,
        repeat: state.repeat,
        volume: state.volume,
        source: state.source,
        currentPosition: state.currentPosition,
        duration: state.duration,
      }),

      skipHydration: true,
    }
  )
)

export const rehydratePlayerStore = () => {
  if (typeof window !== 'undefined') {
    usePlayerStore.persist.rehydrate()
  }
}

export const useCurrentPlayerStore = usePlayerStore
