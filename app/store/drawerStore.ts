/**
 * Drawer/Modal UI State Management
 * Manages the state of various drawers and modals in the application
 */

import { create } from 'zustand'

/**
 * State for drawer and modal management
 */
export interface DrawerState {
  // Playlist drawer
  isPlaylistDrawerOpen: boolean
  currentPlaylistDrawerId: number | undefined

  // Stack drawer
  isStackDrawerOpen: boolean
  tempStack: unknown | null

  // Actions - Playlist drawer
  setIsPlaylistDrawerOpen: (isOpen: boolean) => void
  setCurrentPlaylistDrawerId: (id: number | undefined) => void
  openPlaylistDrawer: (playlistId?: number) => void
  closePlaylistDrawer: () => void

  // Actions - Stack drawer
  openStackDrawer: (stack: unknown) => void
  closeStackDrawer: () => void
  updateTempStack: (stack: unknown) => void
}

export const useDrawerStore = create<DrawerState>((set) => ({
  // Initial state
  isPlaylistDrawerOpen: false,
  currentPlaylistDrawerId: undefined,
  isStackDrawerOpen: false,
  tempStack: null,

  // Playlist drawer actions
  setIsPlaylistDrawerOpen: (isOpen: boolean) => {
    set({ isPlaylistDrawerOpen: isOpen })
  },

  setCurrentPlaylistDrawerId: (id: number | undefined) => {
    set({ currentPlaylistDrawerId: id })
  },

  openPlaylistDrawer: (playlistId?: number) => {
    set({ isPlaylistDrawerOpen: true, currentPlaylistDrawerId: playlistId })
  },

  closePlaylistDrawer: () => {
    set({ isPlaylistDrawerOpen: false, currentPlaylistDrawerId: undefined })
  },

  // Stack drawer actions
  openStackDrawer: (stack: unknown) => {
    set({ isStackDrawerOpen: true, tempStack: stack })
  },

  closeStackDrawer: () => {
    set({ isStackDrawerOpen: false, tempStack: null })
  },

  updateTempStack: (stack: unknown) => {
    set({ tempStack: stack })
  },
}))

