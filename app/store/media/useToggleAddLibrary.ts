import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { EntityTypeEnum } from 'server/db/stack.entity'

import type { UserLibrary } from '../../../server/db/user-library.entity'
import { useFetcherAsync } from '../../lib/useFetcherAsync'
import { useMedia } from './mediaContext'

export const useToggleAddLibrary = () => {
  const fetcher = useFetcherAsync<{ success: boolean; error: string; data: UserLibrary }>()
  const data = useMedia()
  const { library } = data
  const { t } = useTranslation()

  const getIsInLibrary = useCallback(
    (entityType: EntityTypeEnum, entityId: number) => {
      return library?.some(item => item.entityId === entityId && item.entityType === entityType)
    },
    [library]
  )
  const toggleAddLibrary = useCallback(
    async (entityType: EntityTypeEnum, entityId: number) => {
      const isInLibrary = getIsInLibrary(entityType, entityId)
      const originalLibrary = [...library]
      const optimisticLibrary = isInLibrary
        ? library.filter(item => item.entityId !== entityId || item.entityType !== entityType)
        : [...library, { userId: 1, entityType, entityId, addedAt: new Date(), id: Date.now() }]
      data.library = optimisticLibrary
      try {
        const result = await fetcher.submit(
          {
            entityType,
            entityId: entityId.toString(),
          },
          {
            method: 'POST',
            action: '/api/library',
          }
        )

        if (result?.success && !isInLibrary) {
          data.library = data.library.map(item =>
            item.entityId === entityId && item.entityType === entityType ? result.data : item
          )
          // toast(t(`${entityType}.${isInLibrary ? 'removedFromLibrary' : 'addedToLibrary'}`), {
          //   position: 'bottom-center',
          //   hideProgressBar: true,
          //   autoClose: 1000,
          // })
        } else if (!result?.success) {
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
