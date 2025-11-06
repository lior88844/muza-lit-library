import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

import type { Playlist, PlaylistVisibilityEnum } from '../../../server/db/playlist.entity'
import { useFetcherAsync } from '../../lib/useFetcherAsync'
import type { SongDetails } from '../models'
import { useMedia } from './mediaContext'

export interface UpdatePlaylistProps {
  name?: string
  visibility?: PlaylistVisibilityEnum
  description?: string
  songs?: SongDetails[]
}
export const useUpdatePlaylist = () => {
  const fetcher = useFetcherAsync<{ success: boolean; error: string; playlist: Playlist }>()
  const data = useMedia()
  const { playlists } = data
  const { t } = useTranslation()

  const updatePlaylist = useCallback(
    async (playlistId: number, updates: UpdatePlaylistProps) => {
      const originalPlaylists = [...playlists]
      const optimisticPlaylists = playlists.map(playlist =>
        playlist.id === playlistId
          ? {
              ...playlist,
              ...updates,
            }
          : playlist
      )

      data.playlists = optimisticPlaylists

      try {
        const trackUpdates = updates.songs?.map(song => ({ id: song.id, position: song.index }))
        const formData = new FormData()
        formData.append('intent', 'updatePlaylist')
        formData.append('playlistId', playlistId.toString())
        if (updates.name) formData.append('name', updates.name)
        if (updates.visibility) formData.append('visibility', updates.visibility)
        if (updates.description !== undefined) formData.append('description', updates.description)
        if (trackUpdates) formData.append('songs', JSON.stringify(trackUpdates))

        const result = await fetcher.submit(formData, {
          method: 'POST',
          action: '/api/playlist',
        })

        if (!result?.success) {
          data.playlists = originalPlaylists
          toast.error(result?.error || t('playlist.updateFailed'), {
            position: 'bottom-center',
            hideProgressBar: true,
          })
        }
        return result
      } catch {
        data.playlists = originalPlaylists
        toast.error(t('playlist.updateFailed'), {
          position: 'bottom-center',
          hideProgressBar: true,
        })
        return false
      }
    },
    [fetcher, t, playlists, data]
  )

  return { updatePlaylist, loading: fetcher.state === 'loading' }
}
