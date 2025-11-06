import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

import type { Playlist } from '../../../server/db/playlist.entity'
import { useFetcherAsync } from '../../lib/useFetcherAsync'
import type { SongDetails } from '../models'
import { useMedia } from './mediaContext'

interface AddAlbumToPlaylistResult {
  success: boolean
  error?: string
  playlist?: Playlist
}

export const useAddAlbumToPlaylist = () => {
  const fetcher = useFetcherAsync<AddAlbumToPlaylistResult>()
  const data = useMedia()
  const { playlists } = data
  const { t } = useTranslation()

  const addAlbumToPlaylist = useCallback(
    async (playlistId: number, albumTracks: SongDetails[]) => {
      const playlist = playlists.find(p => p.id === playlistId)
      if (!playlist) {
        toast.error('Playlist not found', {
          position: 'bottom-center',
          hideProgressBar: true,
        })
        return false
      }

      const originalPlaylists = [...playlists]

      // Get existing songs in the playlist
      const existingSongs = playlist.songs || []

      // Filter out tracks that already exist in the playlist
      const newTracks = albumTracks.filter(
        track =>
          !existingSongs.some(
            existingSong =>
              existingSong.id === track.id ||
              (existingSong.title === track.title && existingSong.artist === track.artist)
          )
      )

      if (newTracks.length === 0) {
        toast.info('All tracks from this album are already in the playlist', {
          position: 'bottom-center',
          hideProgressBar: true,
          autoClose: 2000,
        })
        return true
      }

      // Add new tracks at the end and reindex
      const updatedSongs = [...existingSongs, ...newTracks].map((song, idx) => ({
        ...song,
        index: idx + 1,
      }))

      // Optimistic update
      const optimisticPlaylists = playlists.map(p =>
        p.id === playlistId
          ? {
              ...p,
              songs: updatedSongs,
            }
          : p
      )
      data.playlists = optimisticPlaylists

      try {
        const trackUpdates = updatedSongs.map(song => ({ id: song.id, position: song.index }))
        const formData = new FormData()
        formData.append('intent', 'updatePlaylist')
        formData.append('playlistId', playlistId.toString())
        formData.append('songs', JSON.stringify(trackUpdates))

        const result = await fetcher.submit(formData, {
          method: 'POST',
          action: '/api/playlist',
        })

        if (result?.success) {
          // Show success toast with revoke button
          const addedTrackIds = newTracks.map(t => t.id)

          toast(
            <div className='flex items-center gap-2'>
              <div className='flex flex-1 flex-col gap-1'>
                <p className='font-semibold text-foreground'>{t('playlist.albumAdded')}</p>
                <p className='text-sm text-muted-foreground opacity-90'>
                  {t('playlist.albumAddedToPlaylist')}
                </p>
              </div>
              <button
                onClick={() => {
                  // Remove the added tracks from the playlist
                  const songsWithoutAdded = updatedSongs.filter(
                    song => !addedTrackIds.includes(song.id)
                  )
                  const reindexedSongs = songsWithoutAdded.map((song, idx) => ({
                    ...song,
                    index: idx + 1,
                  }))

                  // Update local state
                  data.playlists = playlists.map(p =>
                    p.id === playlistId
                      ? {
                          ...p,
                          songs: reindexedSongs,
                        }
                      : p
                  )

                  // Send revoke request
                  const revokeFormData = new FormData()
                  revokeFormData.append('intent', 'updatePlaylist')
                  revokeFormData.append('playlistId', playlistId.toString())
                  revokeFormData.append(
                    'songs',
                    JSON.stringify(reindexedSongs.map(s => ({ id: s.id, position: s.index })))
                  )

                  fetcher.submit(revokeFormData, {
                    method: 'POST',
                    action: '/api/playlist',
                  })

                  toast.dismiss()
                  toast(t('playlist.albumRevoked'), {
                    position: 'bottom-center',
                    hideProgressBar: true,
                    autoClose: 1000,
                  })
                }}
                className='flex h-9 items-center justify-center rounded-full border-[0.66px] border-border bg-background/50 px-4 py-2 backdrop-blur-lg transition-colors hover:bg-background/70'
              >
                <span className='whitespace-nowrap text-base font-medium leading-none text-foreground'>
                  {t('playlist.revoke')}
                </span>
              </button>
            </div>,
            {
              position: 'bottom-center',
              hideProgressBar: true,
              autoClose: 5000,
              closeButton: false,
            }
          )
        } else {
          // Revert on failure
          data.playlists = originalPlaylists
          toast.error(result?.error || 'Failed to add album to playlist', {
            position: 'bottom-center',
            hideProgressBar: true,
          })
        }
        return result
      } catch (error) {
        // Revert on error
        data.playlists = originalPlaylists
        console.error('Add album to playlist error:', error)
        toast.error('Failed to add album to playlist', {
          position: 'bottom-center',
          hideProgressBar: true,
        })
        return false
      }
    },
    [fetcher, t, playlists, data]
  )

  return { addAlbumToPlaylist, loading: fetcher.state === 'loading' }
}

