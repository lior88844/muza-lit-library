import { useCallback } from 'react'
import { toast } from 'react-toastify'

import type { MediaTypeEnum, UserLibrary } from '../../../server/db/user-library.entity'
import { useTranslation } from '../../lib/i18n/translations'
import { useFetcherAsync } from '../../lib/useFetcherAsync'
import { useMedia } from './mediaContext'

export const useToggleAddLibrary = () => {
  const fetcher = useFetcherAsync<{ success: boolean; error: string; data: UserLibrary }>()
  const data = useMedia()
  const { library } = data
  const { t } = useTranslation()

  const getIsInLibrary = useCallback(
    (resourceType: MediaTypeEnum, resourceId: number) => {
      return library?.some(
        item => item.resourceId === resourceId && item.resourceType === resourceType
      )
    },
    [library]
  )
  const toggleAddLibrary = useCallback(
    async (resourceType: MediaTypeEnum, resourceId: number) => {
      const isInLibrary = getIsInLibrary(resourceType, resourceId)
      const originalLibrary = [...library]
      const optimisticLibrary = isInLibrary
        ? library.filter(
            item => item.resourceId !== resourceId || item.resourceType !== resourceType
          )
        : [...library, { userId: 1, resourceType, resourceId, addedAt: new Date(), id: Date.now() }]
      data.library = optimisticLibrary
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

        if (result?.success && !isInLibrary) {
          data.library = data.library.map(item =>
            item.resourceId === resourceId && item.resourceType === resourceType
              ? result.data
              : item
          )
          // toast(t(`${resourceType}.${isInLibrary ? 'removedFromLibrary' : 'addedToLibrary'}`), {
          //   position: 'bottom-center',
          //   hideProgressBar: true,
          //   autoClose: 1000,
          // })
        } else {
          data.library = originalLibrary
          toast.error(t('failedToAddToLibrary'), {
            position: 'bottom-center',
            hideProgressBar: true,
          })
        }
        return result
      } catch (error) {
        data.library = originalLibrary
        console.error('Library action error:', error)
        toast.error(t('failedToAddToLibrary'), {
          position: 'bottom-center',
          hideProgressBar: true,
        })
        return false
      }
    },
    [getIsInLibrary, fetcher, t, library, data]
  )

  return { toggleAddLibrary, loading: fetcher.state === 'loading', getIsInLibrary }
}
