import '../styles/scrollbar.scss'
import '../styles/variables.scss'
import '../styles/main.scss'

import React, { useCallback, useState } from 'react'
import { useNavigate } from 'react-router'

import { AdminUploadPage } from '~/components/adminUpload'
import { adminApiClient } from '~/components/adminUpload/services/adminApiClient'
import { discoverAlbum } from '~/components/adminUpload/services/albumLookup'
import { extractAlbumDiscoverMetadata } from '~/lib/flacMetadata'

import { UploadErrorCodeEnum } from '../components/adminUpload/types/ErrorCode'
import type { UploadItem } from '../components/adminUpload/types/UploadItem'

const isFlacFile = (file: File): boolean => {
  const fileName = file.name.toLowerCase()
  return fileName.endsWith('.flac')
}
const isAudioFile = (file: File): boolean => {
  return file.type.startsWith('audio/')
}
export default function AdminUpload() {
  const navigate = useNavigate()
  const [uploadedItems, setUploadedItems] = useState<UploadItem[]>([])
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set())
  const [isScanning, setIsScanning] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const handleFileUpload = useCallback(async (files: File[]) => {
    const newItems: UploadItem[] = []
    const filesToHandle = files.filter(file => isAudioFile(file))
    // Filter for FLAC files only
    const flacFiles = filesToHandle.filter(isFlacFile)

    // Group all files by folder path to track folders with no FLAC files
    const allFolderMap = new Map<string, File[]>()
    const flacFolderMap = new Map<string, File[]>()

    // First, group all files by folder
    filesToHandle.forEach(file => {
      const path = file.webkitRelativePath || file.name
      const folderPath = path.includes('/') ? path.substring(0, path.lastIndexOf('/')) : 'root'

      if (!allFolderMap.has(folderPath)) {
        allFolderMap.set(folderPath, [])
      }
      allFolderMap.get(folderPath)!.push(file)
    })

    // Then, group FLAC files by folder
    flacFiles.forEach(file => {
      const path = file.webkitRelativePath || file.name
      const folderPath = path.includes('/') ? path.substring(0, path.lastIndexOf('/')) : 'root'

      if (!flacFolderMap.has(folderPath)) {
        flacFolderMap.set(folderPath, [])
      }
      flacFolderMap.get(folderPath)!.push(file)
    })

    // Filter out parent folders that have child folders in the list
    const allFolderPaths = Array.from(flacFolderMap.keys())
    const filteredFolderPaths = allFolderPaths.filter(path => {
      // Keep this folder if no other folder in the list has it as a prefix (i.e., it's not a parent)
      return !allFolderPaths.some(otherPath => otherPath !== path && otherPath.startsWith(path + '/'))
    })

    // Create items for folders with FLAC files (excluding parent folders)
    for (const path of filteredFolderPaths) {
      const folderFiles = flacFolderMap.get(path)!
      const totalSize = folderFiles.reduce((sum, file) => sum + file.size, 0)
      const folderName = path === 'root' ? 'Music Folder' : path.split('/').pop() || path

      // Check if this folder has non-FLAC files that were skipped
      const allFilesInFolder = allFolderMap.get(path) || []
      const skippedCount = allFilesInFolder.length - folderFiles.length

      const newItem: UploadItem = {
        id: `folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: folderName,
        type: 'folder',
        size: totalSize,
        files: folderFiles,
        path,
        errorCode: skippedCount > 0 ? UploadErrorCodeEnum.PARTIAL_UPLOAD : undefined,
        isLookingUp: true, // Start lookup for all items with FLAC files
        loadingState: {
          status: 'loading',
          loadedFiles: 0,
          totalFiles: folderFiles.length,
          progress: 0,
        },
      }

      newItems.push(newItem)
    }

    // Create error items for folders with no FLAC files (excluding parent folders)
    const allFoldersWithoutFlac = Array.from(allFolderMap.keys()).filter(path => !flacFolderMap.has(path))

    const filteredErrorFolderPaths = allFoldersWithoutFlac.filter(path => {
      // Keep this folder if no other folder in allFolderMap has it as a prefix
      return !Array.from(allFolderMap.keys()).some(otherPath => otherPath !== path && otherPath.startsWith(path + '/'))
    })

    filteredErrorFolderPaths.forEach(path => {
      const folderName = path === 'root' ? 'Music Folder' : path.split('/').pop() || path

      newItems.push({
        id: `error-folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: folderName,
        type: 'folder',
        size: 0,
        files: [],
        path,
        errorCode: UploadErrorCodeEnum.ALL_FILES_INVALID,
        loadingState: {
          status: 'error',
          loadedFiles: 0,
          totalFiles: 0,
          progress: 0,
        },
      })
    })

    setUploadedItems(prev => [...prev, ...newItems])
    setIsScanning(true)

    // Simulate scanning process
    setTimeout(() => {
      setIsScanning(false)
    }, 2000)

    // Process metadata extraction and album discovery for each valid folder
    for (const item of newItems) {
      // Only process items without critical errors (error code 1001)
      if (item.files.length > 0 && item.errorCode !== UploadErrorCodeEnum.ALL_FILES_INVALID) {
        // Simulate loading progress for files
        const totalFiles = item.files.length
        for (let i = 0; i < totalFiles; i++) {
          const loadedFiles = i + 1
          const progress = Math.round((loadedFiles / totalFiles) * 100)

          // Update loading progress
          setUploadedItems(prev =>
            prev.map(prevItem =>
              prevItem.id === item.id
                ? {
                    ...prevItem,
                    loadingState: {
                      status: 'loading',
                      loadedFiles,
                      totalFiles,
                      progress,
                    },
                  }
                : prevItem
            )
          )
        }
        try {
          // Extract complete metadata from the first FLAC file
          const metadata = await extractAlbumDiscoverMetadata(item.files)

          if (metadata) {
            // Discover album in backend
            const albumLookup = await discoverAlbum(metadata)

            // Update item with lookup result and remove loading state
            setUploadedItems(prev =>
              prev.map(prevItem => {
                if (prevItem.id === item.id) {
                  const hasValidId = !!albumLookup?.mbId || (prevItem.manualAlbumId !== undefined && prevItem.manualAlbumId > 0)
                  const hasValidCover = !!(albumLookup?.coverUrl || prevItem.coverImageUrl)
                  const isUploadReady = hasValidId && hasValidCover && prevItem.files.length > 0

                  return {
                    ...prevItem,
                    albumLookup,
                    isLookingUp: false,
                    hasValidId,
                    hasValidCover,
                    isUploadReady,
                    errorCode: albumLookup?.error,
                    loadingState: {
                      status: 'loaded',
                      loadedFiles: totalFiles,
                      totalFiles,
                      progress: 100,
                    },
                  }
                }
                return prevItem
              })
            )
          } else {
            // Failed to extract metadata
            throw new Error('Failed to extract metadata')
          }
        } catch (error) {
          console.error('Error processing album discovery:', error)
          // Remove loading state on error
          setUploadedItems(prev =>
            prev.map(prevItem => {
              if (prevItem.id === item.id) {
                const hasValidId = !!(prevItem.manualAlbumId !== undefined && prevItem.manualAlbumId > 0)
                const hasValidCover = !!prevItem.coverImageUrl
                const isUploadReady = hasValidId && hasValidCover && prevItem.files.length > 0

                return {
                  ...prevItem,
                  isLookingUp: false,
                  hasValidId,
                  hasValidCover,
                  isUploadReady,
                  loadingState: {
                    status: 'error',
                    loadedFiles: item.files.length,
                    totalFiles: item.files.length,
                    progress: 0,
                  },
                }
              }
              return prevItem
            })
          )
        }
      }
    }
  }, [])

  const handleItemSelect = useCallback(
    (index: number, selected: boolean) => {
      const item = uploadedItems[index]

      // Don't allow selection if item has critical errors, is not upload ready, or is already uploaded
      if (selected && (item.errorCode === UploadErrorCodeEnum.ALL_FILES_INVALID || !item.isUploadReady || item.isUploaded)) {
        return
      }

      setSelectedItems(prev => {
        const newSet = new Set(prev)
        if (selected) {
          newSet.add(index)
        } else {
          newSet.delete(index)
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
        const selectableIndices = uploadedItems
          .map((item, index) =>
            item.errorCode !== UploadErrorCodeEnum.ALL_FILES_INVALID && item.isUploadReady && !item.isUploaded ? index : -1
          )
          .filter(index => index !== -1)
        setSelectedItems(new Set(selectableIndices))
      } else {
        setSelectedItems(new Set())
      }
    },
    [uploadedItems]
  )

  const handleCancelSelection = useCallback(() => {
    setSelectedItems(new Set())
  }, [])

  const handleProcessUpload = useCallback(async () => {
    const selectedItemList = Array.from(selectedItems).map(index => uploadedItems[index])

    // Filter to only include items that are upload ready
    const uploadableItems = selectedItemList.filter(item => item.isUploadReady && item.files.length > 0)

    if (uploadableItems.length === 0) {
      // eslint-disable-next-line no-console
      console.warn('No uploadable items selected')
      return
    }

    setIsUploading(true)

    try {
      const uploadedItemIds: string[] = []

      // Process each album upload
      for (const item of uploadableItems) {
        // Get album ID (from lookup or manual entry)
        const mbId = item.albumLookup?.mbId || item.manualAlbumId?.toString()
        const discogsId = item.albumLookup?.discogsId || null

        // Get cover image URL (from lookup or manual entry)
        const albumCover = item.albumLookup?.coverUrl || item.coverImageUrl

        // Create FormData for file upload
        const formData = new FormData()

        // Add album metadata
        formData.append('mbId', mbId!)
        formData.append('albumCover', albumCover!)
        formData.append('discogsId', discogsId!)

        // Add FLAC files only
        item.files.forEach((file, index) => {
          formData.append(`files`, file)
        })

        // Upload to API
        const response = await adminApiClient.post('/api/admin/upload-album', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })

        // eslint-disable-next-line no-console
        console.log(`Upload successful for album ${mbId}:`, response.data)
        uploadedItemIds.push(item.id)
      }

      // Mark uploaded items as uploaded
      setUploadedItems(prev => prev.map(item => (uploadedItemIds.includes(item.id) ? { ...item, isUploaded: true } : item)))

      // Clear selection after successful upload
      setSelectedItems(new Set())

      // Show success message
      setUploadSuccessMessage(`Successfully uploaded ${uploadedItemIds.length} album${uploadedItemIds.length > 1 ? 's' : ''}!`)

      // Hide success message after 5 seconds
      setTimeout(() => {
        setUploadSuccessMessage(null)
      }, 5000)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Upload failed:', error)
      // Handle error (show notification, etc.)
    } finally {
      setIsUploading(false)
    }
  }, [selectedItems, uploadedItems])

  const handleManualIdChange = useCallback((itemId: string, albumId: number | undefined) => {
    setUploadedItems(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          const hasValidId = albumId !== undefined && albumId > 0
          const hasValidCover = !!(item.albumLookup?.coverUrl || item.coverImageUrl)
          const isUploadReady = hasValidId && hasValidCover && item.files.length > 0

          return {
            ...item,
            manualAlbumId: albumId,
            hasValidId,
            hasValidCover,
            isUploadReady,
          }
        }
        return item
      })
    )
  }, [])

  const handleCoverUrlChange = useCallback((itemId: string, url: string | undefined) => {
    setUploadedItems(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          const hasValidId = !!(!!item.albumLookup?.mbId || (item.manualAlbumId !== undefined && item.manualAlbumId > 0))
          const hasValidCover = !!url
          const isUploadReady = hasValidId && hasValidCover && item.files.length > 0

          return {
            ...item,
            coverImageUrl: url,
            hasValidId,
            hasValidCover,
            isUploadReady,
          }
        }
        return item
      })
    )
  }, [])

  const handleCancel = useCallback(() => {
    setUploadedItems([])
    setSelectedItems(new Set())
    setIsScanning(false)
    setCurrentPage(1)
    navigate('/')
  }, [navigate])

  return (
    <AdminUploadPage
      uploadedItems={uploadedItems}
      selectedItems={selectedItems}
      isScanning={isScanning}
      isUploading={isUploading}
      uploadSuccessMessage={uploadSuccessMessage}
      currentPage={currentPage}
      itemsPerPage={itemsPerPage}
      onFileUpload={handleFileUpload}
      onItemSelect={handleItemSelect}
      onSelectAll={handleSelectAll}
      onCancelSelection={handleCancelSelection}
      onProcessUpload={handleProcessUpload}
      onCancel={handleCancel}
      onPageChange={setCurrentPage}
      onItemsPerPageChange={setItemsPerPage}
      onManualIdChange={handleManualIdChange}
      onCoverUrlChange={handleCoverUrlChange}
    />
  )
}
