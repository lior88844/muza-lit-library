import '../styles/variables.css'

import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router'

import { AdminFileDropArea, AdminUploadHeader, AdminUploadTable } from '~/components/adminUpload'
import {
  discoverAlbum,
  formatDiscogsId,
  formatMbId,
  getAlbumsToUpload,
  isItemUploadReady,
  UPLOAD_BLOCKING_ERROR_CODES,
  uploadAlbum,
} from '~/components/adminUpload/services/adminUploadService'
import { extractAlbumDiscoverMetadata } from '~/lib/flacMetadata'

import { UploadErrorCodeEnum } from '../components/adminUpload/types/ErrorCode'
import type { UploadItem } from '../components/adminUpload/types/UploadItem'

export default function AdminUpload() {
  const navigate = useNavigate()
  const [uploadedItems, setUploadedItems] = useState<UploadItem[]>([])
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const onDiscoverAlbum = useCallback(async (item: UploadItem) => {
    try {
      // Flatten files array for metadata extraction
      // Extract complete metadata from all FLAC files

      if (item.metadata) {
        if (item.manualAlbumId) {
          item.metadata.musicbrainzAlbumId = formatMbId(item.manualAlbumId)
          setUploadedItems(prev =>
            prev.map(prevItem =>
              prevItem.id === item.id
                ? {
                    ...prevItem,
                    isLookingUp: true,
                  }
                : prevItem
            )
          )
        }
        // Discover album in backend
        const discoverRes = await discoverAlbum(item.metadata)

        // Update item with lookup result and remove loading state
        setUploadedItems(prev =>
          prev.map(prevItem =>
            prevItem.id === item.id
              ? {
                  ...prevItem,
                  discoverRes,
                  isLookingUp: false,
                  errorCode: discoverRes?.error,
                  loadingState: {
                    status: 'loaded',
                  },
                }
              : prevItem
          )
        )
      } else {
        // Failed to extract metadata
        throw new Error('Failed to extract metadata')
      }
    } catch (error) {
      console.error('Error processing album discovery:', error)
      // Remove loading state on error
      setUploadedItems(prev =>
        prev.map(prevItem =>
          prevItem.id === item.id
            ? {
                ...prevItem,
                errorCode: UploadErrorCodeEnum.DISCOVERY_SERVICE_ERROR,
                isLookingUp: false,
                loadingState: {
                  status: 'error',
                },
              }
            : prevItem
        )
      )
    }
  }, [])

  const handleFileUpload = useCallback(
    async (files: File[]) => {
      const newItems = getAlbumsToUpload(files)
      setUploadedItems(prev => {
        // Add only new items to the list
        return [
          ...prev,
          ...newItems.filter(item => !prev.some(prevItem => prevItem.id === item.id)),
        ]
      })
      const itemsWithMetadata = await Promise.all(
        newItems.map(async item => {
          const metadata = await extractAlbumDiscoverMetadata(item)
          return { ...item, metadata }
        })
      )
      const itemIdToMetadata = new Map(itemsWithMetadata.map(item => [item.id, item.metadata]))
      setUploadedItems(prev =>
        prev.map(item =>
          itemIdToMetadata.get(item.id)
            ? { ...item, metadata: itemIdToMetadata.get(item.id)! }
            : item
        )
      )

      // Process metadata extraction and album discovery for each valid folder
      const itemsToDiscover = itemsWithMetadata.filter(item => {
        const totalFiles = item.files.flat().length
        return (
          totalFiles > 0 &&
          !(item.errorCode && UPLOAD_BLOCKING_ERROR_CODES.includes(item.errorCode))
        )
      })
      itemsToDiscover.map(onDiscoverAlbum)
    },
    [onDiscoverAlbum]
  )

  const handleItemSelect = useCallback(
    (itemId: string) => {
      const item = uploadedItems.find(item => item.id === itemId)
      // Don't allow selection if item has critical errors, is not upload ready, or is already uploaded
      if (!item || !isItemUploadReady(item)) {
        return
      }

      setSelectedItemIds(prev => {
        const newSet = new Set(prev)
        if (newSet.has(item.id)) {
          newSet.delete(item.id)
        } else {
          newSet.add(item.id)
        }
        return newSet
      })
    },
    [uploadedItems]
  )

  const handleSelectAll = useCallback(
    (selected: boolean) => {
      if (selected) {
        // Only select items that don't have error code 1001 (All Files Invalid), are upload ready, and not uploaded
        const selectableItemIds = uploadedItems.filter(item => isItemUploadReady(item))
        setSelectedItemIds(new Set(selectableItemIds.map(item => item.id)))
      } else {
        setSelectedItemIds(new Set())
      }
    },
    [uploadedItems]
  )

  const handleCancelSelection = useCallback(() => {
    setSelectedItemIds(new Set())
  }, [])

  const handleProcessUpload = useCallback(async () => {
    const selectedItemList = uploadedItems.filter(item => selectedItemIds.has(item.id))

    // Filter to only include items that are upload ready
    const uploadableItems = selectedItemList.filter(item => isItemUploadReady(item))

    if (uploadableItems.length === 0) {
      // eslint-disable-next-line no-console
      console.warn('No uploadable items selected')
      return
    }

    // Process batches sequentially
    await Promise.all(
      uploadableItems.map(async item => {
        // Process all items in current batch concurrently
        try {
          // Get album ID (from lookup or manual entry)
          const mbId = item.manualAlbumId ? formatMbId(item.manualAlbumId) : item.discoverRes!.mbId!
          const discogsId = item.manualDiscogsId
            ? formatDiscogsId(item.manualDiscogsId)
            : item.discoverRes!.discogsId!

          // Get cover image URL (from lookup or manual entry)
          const albumCover = item.manualCoverImgUrl?.trim() || item.discoverRes?.coverUrl || ''

          // Set loading state
          setUploadedItems(prev =>
            prev.map(prevItem =>
              prevItem.id === item.id
                ? {
                    ...prevItem,
                    loadingState: {
                      status: 'loading',
                    },
                  }
                : prevItem
            )
          )
          setSelectedItemIds(prev => {
            const newSet = new Set(prev)
            newSet.delete(item.id)
            return newSet
          })
          // Upload album
          const res = await uploadAlbum({ mbId, albumCover, discogsId, discFiles: item.files })

          // Update with success
          setUploadedItems(prev =>
            prev.map(prevItem =>
              prevItem.id === item.id
                ? { ...prevItem, uploadRes: res, loadingState: { status: 'loaded' } }
                : prevItem
            )
          )

          // Remove from selected items
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(`Upload failed for item ${item.id}:`, error)
          // Update with error state
          setUploadedItems(prev =>
            prev.map(prevItem =>
              prevItem.id === item.id
                ? {
                    ...prevItem,
                    loadingState: { status: 'error' },
                    errorCode: UploadErrorCodeEnum.UPLOAD_SERVICE_ERROR,
                  }
                : prevItem
            )
          )
        }
      })
    )
  }, [selectedItemIds, uploadedItems])

  const handleManualIdChange = useCallback((itemId: string, albumId: string | undefined) => {
    setUploadedItems(prev =>
      prev.map(item => {
        return item.id === itemId ? { ...item, manualAlbumId: albumId } : item
      })
    )
  }, [])

  const handleManualDiscogsIdChange = useCallback(
    (itemId: string, discogsId: string | undefined) => {
      setUploadedItems(prev =>
        prev.map(item => {
          return item.id === itemId ? { ...item, manualDiscogsId: discogsId } : item
        })
      )
    },
    []
  )

  const handleCoverUrlChange = useCallback((itemId: string, url: string | undefined) => {
    setUploadedItems(prev =>
      prev.map(item => (item.id === itemId ? { ...item, manualCoverImgUrl: url } : item))
    )
  }, [])

  const handleCancel = useCallback(() => {
    setUploadedItems([])
    setSelectedItemIds(new Set())
    setCurrentPage(1)
    navigate('/admin')
  }, [navigate])

  return (
    <div className='flex flex-col h-full bg-background font-sans'>
      <AdminUploadHeader onCancel={handleCancel} />

      <div className='flex-1 flex flex-col py-4 px-8 gap-0'>
        {/* Always show drag area - positioned above the table */}
        <div className='flex items-center justify-center py-3'>
          <AdminFileDropArea onFileUpload={handleFileUpload} />
        </div>

        {/* Show table only when items are uploaded */}
        {uploadedItems.length > 0 && (
          <div className='flex-1 flex flex-col pt-0 min-h-0'>
            <AdminUploadTable
              items={uploadedItems}
              selectedItemIds={selectedItemIds}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              totalItems={uploadedItems.length}
              onItemSelect={handleItemSelect}
              onSelectAll={handleSelectAll}
              onDiscoverAlbum={onDiscoverAlbum}
              onCancelSelection={handleCancelSelection}
              onProcessUpload={handleProcessUpload}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
              onManualIdChange={handleManualIdChange}
              onManualDiscogsIdChange={handleManualDiscogsIdChange}
              onCoverUrlChange={handleCoverUrlChange}
            />
          </div>
        )}
      </div>
    </div>
  )
}
