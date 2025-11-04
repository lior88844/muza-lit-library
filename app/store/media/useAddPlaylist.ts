import { useCallback } from 'react'
import { toast } from 'react-toastify'

import type { Playlist, PlaylistVisibilityEnum } from '../../../server/db/playlist.entity'
import { useTranslation } from '../../lib/i18n/translations'
import { useFetcherAsync } from '../../lib/useFetcherAsync'
import { usePlaylistStore } from '../playlistStore'

export const useAddPlaylist = () => {
  const fetcher = useFetcherAsync<{ success: boolean; error: string; playlist: Playlist }>()
  const { addPlaylist: addPlaylistToStore } = usePlaylistStore()
  const { t } = useTranslation()

  const addPlaylist = useCallback(
    async (name: string, visibility: PlaylistVisibilityEnum, description?: string) => {
      try {
        const formData = new FormData()
        formData.append('intent', 'createPlaylist')
        formData.append('name', name)
        formData.append('visibility', visibility)
        if (description) formData.append('description', description)

        const result = await fetcher.submit(formData, {
          method: 'POST',
          action: '/api/playlist',
        })

        if (result?.success && result.playlist) {
          // Add the new playlist to the store
          const newPlaylist = {
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
          addPlaylistToStore(newPlaylist)

          toast(t('playlist.created'), {
            position: 'bottom-center',
            hideProgressBar: true,
            autoClose: 1000,
          })
        } else {
          toast.error(result?.error || t('playlist.createFailed'), {
            position: 'bottom-center',
            hideProgressBar: true,
          })
        }
        return result
      } catch (error) {
        console.error('Add playlist error:', error)
        toast.error(t('playlist.createFailed'), {
          position: 'bottom-center',
          hideProgressBar: true,
        })
        return false
      }
    },
    [fetcher, t, addPlaylistToStore]
  )

  return { addPlaylist, loading: fetcher.state === 'loading' }
}
