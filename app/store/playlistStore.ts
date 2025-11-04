import { create } from 'zustand'

import type { MusicPlaylist, SongDetails } from './models'

type PlaylistStore = {
  playlists: MusicPlaylist[]
  loading: boolean

  // State setters
  setPlaylists: (playlists: MusicPlaylist[]) => void
  initialize: (playlists: MusicPlaylist[]) => void
  setLoading: (loading: boolean) => void

  // CRUD operations
  addPlaylist: (playlist: MusicPlaylist) => void
  updatePlaylist: (playlistId: number, updates: Partial<MusicPlaylist>) => void
  removePlaylist: (playlistId: number) => void
  getPlaylistById: (playlistId: number) => MusicPlaylist | undefined

  // Helper for updating playlist songs
  updatePlaylistSongs: (playlistId: number, songs: MusicPlaylist['songs']) => void

  // Helpers for adding songs with proper indexing
  addSongsToPlaylist: (playlistId: number, songs: SongDetails[], position?: 'start' | 'end') => MusicPlaylist['songs'] | null
}

export const usePlaylistStore = create<PlaylistStore>((set, get) => ({
  playlists: [],
  loading: false,

  // State setters
  setPlaylists: (playlists: MusicPlaylist[]) => set({ playlists }),

  // Initialize only if store is empty
  initialize: (playlists: MusicPlaylist[]) => {
    const currentPlaylists = get().playlists
    if (playlists.length > 0 && currentPlaylists.length === 0) {
      set({ playlists })
    }
  },

  setLoading: (loading: boolean) => set({ loading }),

  // Add a new playlist
  addPlaylist: (playlist: MusicPlaylist) =>
    set(state => ({
      playlists: [...state.playlists, playlist],
    })),

  // Update an existing playlist
  updatePlaylist: (playlistId: number, updates: Partial<MusicPlaylist>) =>
    set(state => ({
      playlists: state.playlists.map(playlist =>
        playlist.id === playlistId ? { ...playlist, ...updates } : playlist
      ),
    })),

  // Remove a playlist
  removePlaylist: (playlistId: number) =>
    set(state => ({
      playlists: state.playlists.filter(playlist => playlist.id !== playlistId),
    })),

  // Get playlist by ID
  getPlaylistById: (playlistId: number) => {
    return get().playlists.find(playlist => playlist.id === playlistId)
  },

  // Helper to update only the songs in a playlist
  updatePlaylistSongs: (playlistId: number, songs: MusicPlaylist['songs']) =>
    set(state => ({
      playlists: state.playlists.map(playlist =>
        playlist.id === playlistId ? { ...playlist, songs } : playlist
      ),
    })),

  // Add songs to a playlist with proper indexing
  // Returns the updated songs array, or null if playlist not found
  addSongsToPlaylist: (playlistId: number, songs: SongDetails[], position: 'start' | 'end' = 'start') => {
    const playlist = get().playlists.find(p => p.id === playlistId)
    if (!playlist) return null

    // Filter out songs that already exist in the playlist
    const newSongs = songs.filter(
      song =>
        !playlist.songs?.some(
          existingSong =>
            existingSong.id === song.id ||
            (existingSong.title === song.title && existingSong.artist === song.artist)
        )
    )

    if (newSongs.length === 0) {
      return playlist.songs
    }

    // Add songs at the specified position and re-index all songs with sequential positions
    const updatedSongs =
      position === 'start'
        ? [...newSongs, ...playlist.songs].map((song, idx) => ({
            ...song,
            index: idx + 1,
          }))
        : [...playlist.songs, ...newSongs].map((song, idx) => ({
            ...song,
            index: idx + 1,
          }))

    return updatedSongs
  },
}))

