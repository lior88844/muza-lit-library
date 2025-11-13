import { create } from 'zustand'

export interface DrawerState {
  isPlaylistDrawerOpen: boolean
  currentPlaylistDrawerId: number | undefined

  isStackDrawerOpen: boolean
  tempStack: unknown | null

  setIsPlaylistDrawerOpen: (isOpen: boolean) => void
  setCurrentPlaylistDrawerId: (id: number | undefined) => void
  openPlaylistDrawer: (playlistId?: number) => void
  closePlaylistDrawer: () => void

  openStackDrawer: (stack: unknown) => void
  closeStackDrawer: () => void
  updateTempStack: (stack: unknown) => void
}

export const useDrawerStore = create<DrawerState>((set) => ({
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

