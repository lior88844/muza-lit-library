import { toast } from 'react-toastify'
import { create } from 'zustand'

import type { Playlist, PlaylistVisibilityEnum } from '../../server/db/playlist.entity'
import type { MusicPlaylist, SongDetails } from './models'

export interface UpdatePlaylistProps {
  name?: string
  visibility?: PlaylistVisibilityEnum
  description?: string
  songs?: SongDetails[]
}

type PlaylistStore = {
  playlists: MusicPlaylist[]
  loading: boolean

  // State setters
  setPlaylists: (playlists: MusicPlaylist[]) => void
  initialize: (playlists: MusicPlaylist[]) => void
  setLoading: (loading: boolean) => void

  // Local CRUD operations (no API)
  addPlaylistToStore: (playlist: MusicPlaylist) => void
  updatePlaylistInStore: (playlistId: number, updates: Partial<MusicPlaylist>) => void
  removePlaylistFromStore: (playlistId: number) => void
  getPlaylistById: (playlistId: number) => MusicPlaylist | undefined

  // API operations (with side effects)
  addPlaylist: (name: string, visibility: PlaylistVisibilityEnum, description?: string) => Promise<{ success: boolean; error?: string; playlist?: Playlist } | false>
  updatePlaylist: (playlistId: number, updates: UpdatePlaylistProps) => Promise<{ success: boolean; error?: string; playlist?: Playlist } | false>
  removePlaylist: (playlistId: number) => Promise<{ success: boolean; error?: string } | false>

  // Helper for updating playlist songs
  updatePlaylistSongs: (playlistId: number, songs: MusicPlaylist['songs']) => void

  // Helpers for adding songs with proper indexing
  addSongsToPlaylist: (playlistId: number, songs: SongDetails[], position?: 'start' | 'end') => MusicPlaylist['songs'] | null
}

// Helper to get translations (simple fallback since we can't use hooks in store)
const getTranslation = (key: string): string => {
  const translations: Record<string, string> = {
    'playlist.created': 'Playlist created',
    'playlist.createFailed': 'Failed to create playlist',
    'playlist.deleted': 'Playlist deleted',
    'playlist.deleteFailed': 'Failed to delete playlist',
    'playlist.updateFailed': 'Failed to update playlist',
  }
  return translations[key] || key
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

  // Local store operations (no API calls)
  addPlaylistToStore: (playlist: MusicPlaylist) =>
    set(state => ({
      playlists: [...state.playlists, playlist],
    })),

  updatePlaylistInStore: (playlistId: number, updates: Partial<MusicPlaylist>) =>
    set(state => ({
      playlists: state.playlists.map(playlist =>
        playlist.id === playlistId ? { ...playlist, ...updates } : playlist
      ),
    })),

  removePlaylistFromStore: (playlistId: number) =>
    set(state => ({
      playlists: state.playlists.filter(playlist => playlist.id !== playlistId),
    })),

  // Get playlist by ID
  getPlaylistById: (playlistId: number) => {
    return get().playlists.find(playlist => playlist.id === playlistId)
  },

  // API operation: Add playlist
  addPlaylist: async (name: string, visibility: PlaylistVisibilityEnum, description?: string) => {
    set({ loading: true })
    try {
      const formData = new FormData()
      formData.append('intent', 'createPlaylist')
      formData.append('name', name)
      formData.append('visibility', visibility)
      if (description) formData.append('description', description)

      const response = await fetch('/api/playlist', {
        method: 'POST',
        body: formData,
      })

      const result = (await response.json()) as { success: boolean; error: string; playlist: Playlist }

      if (result?.success && result.playlist) {
        // Add the new playlist to the store
        const newPlaylist: MusicPlaylist = {
          id: result.playlist.id,
          title: result.playlist.name,
          name: result.playlist.name,
          visibility: result.playlist.visibility || undefined,
          description: result.playlist.description || undefined,
          songs: [],
          suggestions: [],
          imageSrc: result.playlist.coverImage || '',
          createdAt: result.playlist.createdAt || new Date(),
        }
        get().addPlaylistToStore(newPlaylist)

        toast(getTranslation('playlist.created'), {
          position: 'bottom-center',
          hideProgressBar: true,
          autoClose: 1000,
        })
      } else {
        toast.error(result?.error || getTranslation('playlist.createFailed'), {
          position: 'bottom-center',
          hideProgressBar: true,
        })
      }
      return result
    } catch (error) {
      console.error('Add playlist error:', error)
      toast.error(getTranslation('playlist.createFailed'), {
        position: 'bottom-center',
        hideProgressBar: true,
      })
      return false
    } finally {
      set({ loading: false })
    }
  },

  // API operation: Update playlist
  updatePlaylist: async (playlistId: number, updates: UpdatePlaylistProps) => {
    // Store original state for rollback
    const originalPlaylist = get().playlists.find(p => p.id === playlistId)
    if (!originalPlaylist) return false

    // Optimistic update - update the store immediately
    const uiUpdates = {
      ...updates,
      // Map 'name' to 'title' for the UI
      ...(updates.name && { title: updates.name }),
    }
    get().updatePlaylistInStore(playlistId, uiUpdates)

    set({ loading: true })
    try {
      const trackUpdates = updates.songs?.map(song => ({ id: song.id, position: song.index }))
      const formData = new FormData()
      formData.append('intent', 'updatePlaylist')
      formData.append('playlistId', playlistId.toString())
      if (updates.name) formData.append('name', updates.name)
      if (updates.visibility) formData.append('visibility', updates.visibility)
      if (updates.description !== undefined) formData.append('description', updates.description)
      if (trackUpdates) formData.append('songs', JSON.stringify(trackUpdates))

      const response = await fetch('/api/playlist', {
        method: 'POST',
        body: formData,
      })

      const result = (await response.json()) as { success: boolean; error: string; playlist: Playlist }

      if (!result?.success) {
        // Rollback on failure
        get().updatePlaylistInStore(playlistId, originalPlaylist)
        toast.error(result?.error || getTranslation('playlist.updateFailed'), {
          position: 'bottom-center',
          hideProgressBar: true,
        })
      }
      return result
    } catch (error) {
      // Rollback on error
      get().updatePlaylistInStore(playlistId, originalPlaylist)
      toast.error(getTranslation('playlist.updateFailed'), {
        position: 'bottom-center',
        hideProgressBar: true,
      })
      return false
    } finally {
      set({ loading: false })
    }
  },

  // API operation: Remove playlist
  removePlaylist: async (playlistId: number) => {
    // Store original playlist for rollback
    const originalPlaylist = get().playlists.find(p => p.id === playlistId)

    // Optimistic delete
    get().removePlaylistFromStore(playlistId)

    set({ loading: true })
    try {
      const formData = new FormData()
      formData.append('intent', 'deletePlaylist')
      formData.append('playlistId', playlistId.toString())

      const response = await fetch('/api/playlist', {
        method: 'POST',
        body: formData,
      })

      const result = (await response.json()) as { success: boolean; error: string }

      if (result?.success) {
        toast(getTranslation('playlist.deleted'), {
          position: 'bottom-center',
          hideProgressBar: true,
          autoClose: 1000,
        })
      } else {
        // Rollback on failure
        if (originalPlaylist) {
          get().addPlaylistToStore(originalPlaylist)
        }
        toast.error(result?.error || getTranslation('playlist.deleteFailed'), {
          position: 'bottom-center',
          hideProgressBar: true,
        })
      }
      return result
    } catch (error) {
      // Rollback on error
      if (originalPlaylist) {
        get().addPlaylistToStore(originalPlaylist)
      }
      console.error('Remove playlist error:', error)
      toast.error(getTranslation('playlist.deleteFailed'), {
        position: 'bottom-center',
        hideProgressBar: true,
      })
      return false
    } finally {
      set({ loading: false })
    }
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

