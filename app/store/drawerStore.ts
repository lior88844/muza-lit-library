import { create } from 'zustand'

import type { StackToEdit } from './models'

export interface DrawerState {
  isPlaylistDrawerOpen: boolean
  currentPlaylistDrawerId: number | undefined

  isStackDrawerOpen: boolean
  tempStack: StackToEdit | null

  setIsPlaylistDrawerOpen: (isOpen: boolean) => void
  setCurrentPlaylistDrawerId: (id: number | undefined) => void
  openPlaylistDrawer: (playlistId?: number) => void
  closePlaylistDrawer: () => void

  openStackDrawer: (stack: StackToEdit) => void
  closeStackDrawer: () => void
  updateTempStack: (stack: StackToEdit) => void
}

export const useDrawerStore = create<DrawerState>(set => ({
  isPlaylistDrawerOpen: false,
  currentPlaylistDrawerId: undefined,
  isStackDrawerOpen: false,
  tempStack: null,

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

  openStackDrawer: (stack: StackToEdit) => {
    set({ isStackDrawerOpen: true, tempStack: stack })
  },

  closeStackDrawer: () => {
    set({ isStackDrawerOpen: false, tempStack: null })
  },

  updateTempStack: (stack: StackToEdit) => {
    set({ tempStack: stack })
  },
}))
