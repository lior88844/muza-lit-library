import type { MiniAlbum } from 'server/api/album/types/MiniAlbumResponse'
import { create } from 'zustand'

import type { SongDetails, StackToEdit } from './models'

type currentPlayerStore = {
  selectedSong: SongDetails | null
  selectedPlaListOrAlbum: MiniAlbum | null
  isPlaying: boolean
  playCountIncremented: boolean
  isPlaylistDrawerOpen: boolean
  currentPlaylistDrawerId: number | undefined
  isStackDrawerOpen: boolean
  tempStack: StackToEdit | null
  setIsPlaying: (isPlaying: boolean) => void
  setSelectedSong: (song: SongDetails) => void
  setSelectedPlaListOrAlbum: (album: MiniAlbum) => void
  togglePlayPause: () => void
  setPlayCountIncremented: (incremented: boolean) => void
  setIsPlaylistDrawerOpen: (isOpen: boolean) => void
  setCurrentPlaylistDrawerId: (id: number | undefined) => void
  openPlaylistDrawer: (playlistId?: number) => void
  closePlaylistDrawer: () => void
  openStackDrawer: (stack: StackToEdit) => void
  closeStackDrawer: () => void
  updateTempStack: (stack: StackToEdit) => void
}

export const useCurrentPlayerStore = create<currentPlayerStore>((set, get) => ({
  selectedSong: null,
  isPlaying: false,
  selectedPlaListOrAlbum: null,
  playCountIncremented: false,
  isPlaylistDrawerOpen: false,
  currentPlaylistDrawerId: undefined,
  isStackDrawerOpen: false,
  tempStack: null,

  setSelectedSong: (song: SongDetails) => set({ selectedSong: song, playCountIncremented: false }),
  setIsPlaying: (play: boolean) => set({ isPlaying: play }),

  setSelectedPlaListOrAlbum: (album: MiniAlbum) => set({ selectedPlaListOrAlbum: album }),

  togglePlayPause: () => set({ isPlaying: !get().isPlaying }),

  setPlayCountIncremented: (incremented: boolean) => set({ playCountIncremented: incremented }),

  setIsPlaylistDrawerOpen: (isOpen: boolean) => set({ isPlaylistDrawerOpen: isOpen }),

  setCurrentPlaylistDrawerId: (id: number | undefined) => set({ currentPlaylistDrawerId: id }),

  openPlaylistDrawer: (playlistId?: number) =>
    set({ isPlaylistDrawerOpen: true, currentPlaylistDrawerId: playlistId }),

  closePlaylistDrawer: () =>
    set({ isPlaylistDrawerOpen: false, currentPlaylistDrawerId: undefined }),

  openStackDrawer: (stack: StackToEdit) => set({ isStackDrawerOpen: true, tempStack: stack }),

  closeStackDrawer: () => set({ isStackDrawerOpen: false, tempStack: null }),

  updateTempStack: (stack: StackToEdit) => set({ tempStack: stack }),
}))
