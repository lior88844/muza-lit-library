import { useCallback, useEffect, useState } from 'react'

import { AdminFileDropArea, AdminUploadTable } from '~/components/adminUpload'
import {
  discoverAlbum,
  formatDiscogsId,
  formatMbId,
  getAlbumsToUpload,
  isItemUploadReady,
  prepareAlbumUpload,
  prepareQueue,
  UPLOAD_BLOCKING_ERROR_CODES,
  uploadFilesToS3,
} from '~/components/adminUpload/services/adminUploadService'
import { extractAlbumDiscoverMetadata } from '~/lib/flacMetadata'

import { UploadErrorCodeEnum } from '../components/adminUpload/types/ErrorCode'
import type { FileUploadProgress } from '../components/adminUpload/types/PrepareUploadResponse'
import type { UploadItem } from '../components/adminUpload/types/UploadItem'

export default function AdminUpload() {
  const [uploadedItems, setUploadedItems] = useState<UploadItem[]>([])
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set())

  // Warn user before leaving page during uploads
  useEffect(() => {
    const hasActiveUploads = uploadedItems.some(
      item => item.phase === 'waiting' || item.phase === 'preparing' || item.phase === 'uploading'
    )

    if (hasActiveUploads) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault()
        // Modern browsers require returnValue to be set
        e.returnValue = ''
        return ''
      }

      window.addEventListener('beforeunload', handleBeforeUnload)
      return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [uploadedItems])

  const onDiscoverAlbum = useCallback(async (item: UploadItem) => {
    try {
      // Set discovering phase
      setUploadedItems(prev =>
        prev.map(prevItem =>
          prevItem.id === item.id
            ? {
                ...prevItem,
                phase: 'discovering' as const,
              }
            : prevItem
        )
      )

      if (item.metadata) {
        if (item.manualAlbumId) {
          item.metadata.musicbrainzAlbumId = formatMbId(item.manualAlbumId)
        }

        // Discover album in backend
        const discoverRes = await discoverAlbum(item.metadata)

        // Update item with lookup result
        setUploadedItems(prev =>
          prev.map(prevItem =>
            prevItem.id === item.id
              ? {
                  ...prevItem,
                  discoverRes,
                  errorCode: discoverRes?.error,
                  phase: discoverRes?.error ? ('error' as const) : ('idle' as const),
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
      // Set error phase
      setUploadedItems(prev =>
        prev.map(prevItem =>
          prevItem.id === item.id
            ? {
                ...prevItem,
                errorCode: UploadErrorCodeEnum.DISCOVERY_SERVICE_ERROR,
                phase: 'error' as const,
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

  const handleChangeSelection = useCallback((selectedItemIds: string[]) => {
    setSelectedItemIds(new Set(selectedItemIds))
  }, [])

  const handleProcessUpload = useCallback(async () => {
    const selectedItemList = uploadedItems.filter(item => selectedItemIds.has(item.id))

    // Filter to only include items that are upload ready
    const uploadableItems = selectedItemList.filter(item => isItemUploadReady(item))

    if (uploadableItems.length === 0) {
      console.warn('No uploadable items selected')
      return
    }

    // Deselect items and set them to waiting status
    setSelectedItemIds(new Set())
    setUploadedItems(prev =>
      prev.map(prevItem =>
        uploadableItems.some(item => item.id === prevItem.id)
          ? { ...prevItem, phase: 'waiting', errorCode: undefined }
          : prevItem
      )
    )

    // Process items concurrently using p-queue (max 3 at a time)
    await Promise.all(
      uploadableItems.map(item =>
        prepareQueue.add(async () => {
          try {
            // Get album ID (from lookup or manual entry)
            const mbId = item.manualAlbumId
              ? formatMbId(item.manualAlbumId)
              : item.discoverRes!.mbId!
            const discogsId = item.manualDiscogsId
              ? formatDiscogsId(item.manualDiscogsId)
              : item.discoverRes!.discogsId!

            // Get cover image URL (from lookup or manual entry)
            const albumCover = item.manualCoverImgUrl?.trim() || item.discoverRes?.coverUrl || ''

            // Step 1: Prepare album upload
            setUploadedItems(prev =>
              prev.map(prevItem =>
                prevItem.id === item.id
                  ? {
                      ...prevItem,
                      phase: 'preparing' as const,
                    }
                  : prevItem
              )
            )

            const prepareRes = await prepareAlbumUpload({
              mbId,
              albumCover,
              discogsId,
              discFiles: item.files,
            })

            if (!prepareRes.success) {
              // Preparation failed
              setUploadedItems(prev =>
                prev.map(prevItem =>
                  prevItem.id === item.id
                    ? {
                        ...prevItem,
                        phase: 'error' as const,
                        errorCode: UploadErrorCodeEnum.UPLOAD_SERVICE_ERROR,
                        prepareRes,
                      }
                    : prevItem
                )
              )
              return
            }

            // Step 2: Upload files to S3
            const uploadProgress = new Map<string, FileUploadProgress>()

            // Update state with prepare result and uploading phase
            setUploadedItems(prev =>
              prev.map(prevItem =>
                prevItem.id === item.id
                  ? {
                      ...prevItem,
                      phase: 'uploading' as const,
                      prepareRes,
                      uploadProgress,
                    }
                  : prevItem
              )
            )

            const uploadResult = await uploadFilesToS3(
              prepareRes.trackUploads,
              item.files,
              (fileName: string, progress: FileUploadProgress) => {
                // Update progress for this file
                uploadProgress.set(fileName, progress)
                setUploadedItems(prev =>
                  prev.map(prevItem =>
                    prevItem.id === item.id
                      ? {
                          ...prevItem,
                          uploadProgress: new Map(uploadProgress),
                        }
                      : prevItem
                  )
                )
              }
            )

            // Update final state
            setUploadedItems(prev =>
              prev.map(prevItem =>
                prevItem.id === item.id
                  ? {
                      ...prevItem,
                      phase: uploadResult.success ? ('completed' as const) : ('error' as const),
                      uploadErrors: uploadResult.errors.map(e => e.error),
                    }
                  : prevItem
              )
            )
          } catch (error) {
            console.error(`Upload failed for item ${item.id}:`, error)
            // Update with error state
            setUploadedItems(prev =>
              prev.map(prevItem =>
                prevItem.id === item.id
                  ? {
                      ...prevItem,
                      phase: 'error' as const,
                      errorCode: UploadErrorCodeEnum.UPLOAD_SERVICE_ERROR,
                    }
                  : prevItem
              )
            )
          }
        })
      )
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

  return (
    <div className='bg-background flex h-full flex-col font-sans'>
      <div className='flex flex-1 flex-col gap-0 px-8 py-4'>
        {/* Always show drag area - positioned above the table */}
        <div className='flex items-center justify-center py-3'>
          <AdminFileDropArea onFileUpload={handleFileUpload} />
        </div>

        {/* Show table only when items are uploaded */}
        {uploadedItems.length > 0 && (
          <div className='flex min-h-0 flex-1 flex-col pt-0'>
            <AdminUploadTable
              items={uploadedItems}
              selectedItemIds={selectedItemIds}
              onSelectionChange={handleChangeSelection}
              onDiscoverAlbum={onDiscoverAlbum}
              onProcessUpload={handleProcessUpload}
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
