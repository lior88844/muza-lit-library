import { useCallback } from 'react'
import { toast } from 'react-toastify'

import { useTranslation } from '../../lib/i18n/translations'
import { useFetcherAsync } from '../../lib/useFetcherAsync'
import { usePlaylistStore } from '../playlistStore'

export const useRemovePlaylist = () => {
  const fetcher = useFetcherAsync<{ success: boolean; error: string }>()
  const { removePlaylist: removePlaylistFromStore, addPlaylist: addPlaylistToStore, playlists } = usePlaylistStore()
  const { t } = useTranslation()

  const removePlaylist = useCallback(
    async (playlistId: number) => {
      // Store original playlist for rollback
      const originalPlaylist = playlists.find(p => p.id === playlistId)

      // Optimistic delete
      removePlaylistFromStore(playlistId)

      try {
        const formData = new FormData()
        formData.append('intent', 'deletePlaylist')
        formData.append('playlistId', playlistId.toString())

        const result = await fetcher.submit(formData, {
          method: 'POST',
          action: '/api/playlist',
        })

        if (result?.success) {
          toast(t('playlist.deleted'), {
            position: 'bottom-center',
            hideProgressBar: true,
            autoClose: 1000,
          })
        } else {
          // Rollback on failure
          if (originalPlaylist) {
            addPlaylistToStore(originalPlaylist)
          }
          toast.error(result?.error || t('playlist.deleteFailed'), {
            position: 'bottom-center',
            hideProgressBar: true,
          })
        }
        return result
      } catch (error) {
        // Rollback on error
        if (originalPlaylist) {
          addPlaylistToStore(originalPlaylist)
        }
        console.error('Remove playlist error:', error)
        toast.error(t('playlist.deleteFailed'), {
          position: 'bottom-center',
          hideProgressBar: true,
        })
        return false
      }
    },
    [fetcher, t, playlists, removePlaylistFromStore, addPlaylistToStore]
  )

  return { removePlaylist, loading: fetcher.state === 'loading' }
}
