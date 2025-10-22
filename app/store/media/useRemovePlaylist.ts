import { useCallback } from 'react'
import { toast } from 'react-toastify'

import { useTranslation } from '../../lib/i18n/translations'
import { useFetcherAsync } from '../../lib/useFetcherAsync'
import { useMedia } from './mediaContext'

export const useRemovePlaylist = () => {
  const fetcher = useFetcherAsync<{ success: boolean; error: string }>()
  const data = useMedia()
  const { playlists } = data
  const { t } = useTranslation()

  const removePlaylist = useCallback(
    async (playlistId: number) => {
      try {
        const formData = new FormData()
        formData.append('intent', 'deletePlaylist')
        formData.append('playlistId', playlistId.toString())

        const result = await fetcher.submit(formData, {
          method: 'POST',
          action: '/api/playlist',
        })

        if (result?.success) {
          // Update the playlists state in context
          const updatedPlaylists = playlists.filter(playlist => playlist.id !== playlistId)
          data.playlists = updatedPlaylists

          toast(t('playlist.deleted'), {
            position: 'bottom-center',
            hideProgressBar: true,
            autoClose: 1000,
          })
        } else {
          toast.error(result?.error || t('playlist.deleteFailed'), {
            position: 'bottom-center',
            hideProgressBar: true,
          })
        }
        return result
      } catch (error) {
        console.error('Remove playlist error:', error)
        toast.error(t('playlist.deleteFailed'), {
          position: 'bottom-center',
          hideProgressBar: true,
        })
        return false
      }
    },
    [fetcher, t, playlists, data]
  )

  return { removePlaylist, loading: fetcher.state === 'loading' }
}
