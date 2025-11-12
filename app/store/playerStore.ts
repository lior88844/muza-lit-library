/**
 * Music Player Store
 * Centralized state management for the music player with queue, shuffle, repeat, and persistence
 */

import { create } from 'zustand'
import { createJSONStorage,persist } from 'zustand/middleware'

import type { PlayerState,QueueItem, RepeatMode } from '~/types/player'

/**
 * Shuffle array using Fisher-Yates algorithm
 */
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
      // Current playback
      current: null,
      isPlaying: false,
      currentPosition: 0,
      duration: 0,

      // Audio settings
      volume: 0.75,

      // Queue management
      queue: [],
      queueIndex: -1,
      originalQueue: [],

      // Playback modes
      shuffle: false,
      repeat: 'off',

      // Context
      source: null,

      // Legacy compat
      selectedSong: null,
      selectedPlaListOrAlbum: null,

      // Computed properties
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

      // === PLAYBACK CONTROL ACTIONS ===

      /**
       * Load a queue and start playing
       * This is the primary way to start playback from any source
       */
      playQueue: ({ items, startIndex = 0, source }) => {
        if (items.length === 0) return

        const validIndex = Math.max(0, Math.min(startIndex, items.length - 1))

        set({
          queue: items,
          originalQueue: items,
          queueIndex: validIndex,
          current: items[validIndex],
          selectedSong: items[validIndex], // legacy compat
          isPlaying: true,
          source: source || null,
          currentPosition: 0,
        })
      },

      /**
       * Toggle or force play/pause state
       */
      playPause: (force?: boolean) => {
        const currentState = get().isPlaying
        set({ isPlaying: force !== undefined ? force : !currentState })
      },

      /**
       * Set playing state directly
       */
      setIsPlaying: (isPlaying: boolean) => {
        set({ isPlaying })
      },

      /**
       * Advance to next track with shuffle/repeat logic
       */
      next: () => {
        const state = get()

        // Repeat one - replay current
        if (state.repeat === 'one') {
          set({
            currentPosition: 0,
            isPlaying: true,
          })
          return
        }

        let nextIndex = state.queueIndex + 1

        // End of queue handling
        if (nextIndex >= state.queue.length) {
          if (state.repeat === 'all') {
            nextIndex = 0 // Loop back to start
          } else {
            // No repeat - stop playing
            set({ isPlaying: false })
            return
          }
        }

        // Shuffle logic - pick random from remaining
        if (state.shuffle && nextIndex < state.queue.length) {
          const remaining = state.queue.length - nextIndex
          if (remaining > 1) {
            // Random offset from current position
            const randomOffset = Math.floor(Math.random() * remaining)
            nextIndex = nextIndex + randomOffset
          }
        }

        set({
          queueIndex: nextIndex,
          current: state.queue[nextIndex],
          selectedSong: state.queue[nextIndex], // legacy compat
          isPlaying: true,
          currentPosition: 0,
        })
      },

      /**
       * Go to previous track
       */
      prev: () => {
        const state = get()

        // Repeat one - restart current
        if (state.repeat === 'one') {
          set({
            currentPosition: 0,
            isPlaying: true,
          })
          return
        }

        // If more than 3 seconds into song, restart it
        if (state.currentPosition > 3) {
          set({
            currentPosition: 0,
            isPlaying: true,
          })
          return
        }

        // Go to actual previous track
        let prevIndex = state.queueIndex - 1

        if (prevIndex < 0) {
          // At start of queue
          if (state.repeat === 'all') {
            prevIndex = state.queue.length - 1 // Loop to end
          } else {
            prevIndex = 0 // Stay at first track
          }
        }

        set({
          queueIndex: prevIndex,
          current: state.queue[prevIndex],
          selectedSong: state.queue[prevIndex], // legacy compat
          isPlaying: true,
          currentPosition: 0,
        })
      },

      // === SEEKING & POSITION ===

      seekTo: (seconds: number) => {
        set({ currentPosition: Math.max(0, seconds) })
      },

      setCurrentPosition: (seconds: number) => {
        set({ currentPosition: seconds })
      },

      setDuration: (seconds: number) => {
        set({ duration: seconds })
      },

      // === AUDIO SETTINGS ===

      setVolume: (volume: number) => {
        set({ volume: Math.min(1, Math.max(0, volume)) })
      },

      // === PLAYBACK MODES ===

      setRepeat: (mode: RepeatMode) => {
        set({ repeat: mode })
      },

      /**
       * Toggle shuffle mode
       * When enabling: shuffles queue but keeps current song at index 0
       * When disabling: restores original queue order
       */
      toggleShuffle: () => {
        const state = get()

        if (state.shuffle) {
          // Turn off shuffle - restore original order
          const currentSong = state.current
          const newIndex = state.originalQueue.findIndex(s => s.id === currentSong?.id)

          set({
            shuffle: false,
            queue: state.originalQueue,
            queueIndex: newIndex >= 0 ? newIndex : 0,
          })
        } else {
          // Turn on shuffle - randomize queue keeping current song first
          const currentSong = state.current
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

      // === LEGACY COMPATIBILITY ACTIONS ===

      /**
       * Legacy setSelectedSong - wraps playQueue for backward compatibility
       * Loads a single-song queue
       */
      setSelectedSong: (song: QueueItem) => {
        get().playQueue({
          items: [song],
          startIndex: 0,
          source: { type: 'custom', title: song.title },
        })
      },

      /**
       * Legacy togglePlayPause - alias for playPause()
       */
      togglePlayPause: () => {
        get().playPause()
      },

      setSelectedPlaListOrAlbum: (album: unknown) => {
        set({ selectedPlaListOrAlbum: album })
      },
    }),
    {
      name: 'muza-player-v1',
      storage: createJSONStorage(() => localStorage),
      
      // Only persist specific fields
      partialize: state => ({
        current: state.current,
        queue: state.queue,
        queueIndex: state.queueIndex,
        originalQueue: state.originalQueue,
        shuffle: state.shuffle,
        repeat: state.repeat,
        volume: state.volume,
        source: state.source,
        currentPosition: state.currentPosition,
        duration: state.duration,
        // Don't persist isPlaying (auto-pause on refresh is safer UX)
        // Don't persist playAttempts (session-specific)
      }),

      // Skip hydration on server-side
      skipHydration: true,
    }
  )
)

// Expose rehydration for client-side initialization
export const rehydratePlayerStore = () => {
  if (typeof window !== 'undefined') {
    usePlayerStore.persist.rehydrate()
  }
}

// Export store for backward compatibility
export const useCurrentPlayerStore = usePlayerStore

