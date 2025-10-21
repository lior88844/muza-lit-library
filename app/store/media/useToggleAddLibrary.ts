import { useCallback } from 'react'
import { toast } from 'react-toastify'

import type { MediaTypeEnum, UserLibrary } from '../../../server/db/user-library.entity'
import { useTranslation } from '../../lib/i18n/translations'
import { useFetcherAsync } from '../../lib/useFetcherAsync'
import { useMedia, useUpdateLibrary } from './mediaContext'

export const useToggleAddLibrary = () => {
  const fetcher = useFetcherAsync<{ success: boolean; error: string; data: UserLibrary }>()
  const data = useMedia()
  const { library } = data
  const updateLibrary = useUpdateLibrary()
  const { t } = useTranslation()

  const getIsInLibrary = useCallback(
    (resourceType: MediaTypeEnum, resourceId: number) => {
      return library?.some(item => item.resourceId === resourceId && item.resourceType === resourceType)
    },
    [library]
  )
  const toggleAddLibrary = useCallback(
    async (resourceType: MediaTypeEnum, resourceId: number) => {
      const isInLibrary = getIsInLibrary(resourceType, resourceId)
      try {
        const result = await fetcher.submit(
          {
            resourceType,
            resourceId: resourceId.toString(),
          },
          {
            method: 'POST',
            action: '/api/library',
          }
        )

        if (result?.success) {
          // Update the library state in context
          if (isInLibrary) {
            // Remove from library
            const updatedLibrary = library.filter(item => !(item.resourceId === resourceId && item.resourceType === resourceType))
            updateLibrary(updatedLibrary)
          } else {
            updateLibrary([...library, result.data])
          }

          toast(t(`${resourceType}.${isInLibrary ? 'removedFromLibrary' : 'addedToLibrary'}`), {
            position: 'bottom-center',
            hideProgressBar: true,
            autoClose: 1000,
          })
        } else {
          toast.error(t('failedToAddToLibrary'), {
            position: 'bottom-center',
            hideProgressBar: true,
          })
        }
        return result
      } catch (error) {
        console.error('Library action error:', error)
        toast.error(t('failedToAddToLibrary'), {
          position: 'bottom-center',
          hideProgressBar: true,
        })
        return false
      }
    },
    [fetcher, t, getIsInLibrary, library, updateLibrary]
  )

  return { toggleAddLibrary, loading: fetcher.state === 'loading', getIsInLibrary }
}
