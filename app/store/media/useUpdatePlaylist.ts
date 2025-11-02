import { useCallback } from 'react'
import { toast } from 'react-toastify'

import type { Playlist, PlaylistVisibilityEnum } from '../../../server/db/playlist.entity'
import { useTranslation } from '../../lib/i18n/translations'
import { useFetcherAsync } from '../../lib/useFetcherAsync'
import type { SongDetails } from '../models'
import { usePlaylistStore } from '../playlistStore'

export interface UpdatePlaylistProps {
  name?: string
  visibility?: PlaylistVisibilityEnum
  description?: string
  songs?: SongDetails[]
}
export const useUpdatePlaylist = () => {
  const fetcher = useFetcherAsync<{ success: boolean; error: string; playlist: Playlist }>()
  const { playlists, updatePlaylist: updatePlaylistInStore } = usePlaylistStore()
  const { t } = useTranslation()

  const updatePlaylist = useCallback(
    async (playlistId: number, updates: UpdatePlaylistProps) => {
      // Store original state for rollback
      const originalPlaylist = playlists.find(p => p.id === playlistId)
      if (!originalPlaylist) return false

      // Optimistic update - update the store immediately
      const uiUpdates = {
        ...updates,
        // Map 'name' to 'title' for the UI
        ...(updates.name && { title: updates.name }),
      }
      updatePlaylistInStore(playlistId, uiUpdates)

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
          // Rollback on failure
          updatePlaylistInStore(playlistId, originalPlaylist)
          toast.error(result?.error || t('playlist.updateFailed'), {
            position: 'bottom-center',
            hideProgressBar: true,
          })
        }
        return result
      } catch (error) {
        // Rollback on error
        updatePlaylistInStore(playlistId, originalPlaylist)
        toast.error(t('playlist.updateFailed'), {
          position: 'bottom-center',
          hideProgressBar: true,
        })
        return false
      }
    },
    [fetcher, t, playlists, updatePlaylistInStore]
  )

  return { updatePlaylist, loading: fetcher.state === 'loading' }
}
