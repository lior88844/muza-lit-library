import { AxiosError } from 'axios'
import PQueue from 'p-queue'

import { adminApiClient } from '~/components/adminUpload/services/adminApiClient'
import type {
  AlbumLookupResult,
  DiscoverResponse,
} from '~/components/adminUpload/types/DiscoverResponse'
import { UploadErrorCodeEnum } from '~/components/adminUpload/types/ErrorCode'
import type { UploadItem } from '~/components/adminUpload/types/UploadItem'
import type { DiscoverMetadata } from '~/lib/flacMetadata'

import type { AlbumUploadResponse } from '../types/AlbumUploadResponse'

// Create a queue with max 3 concurrent requests
const discoveryQueue = new PQueue({ concurrency: 3 })
const uploadQueue = new PQueue({ concurrency: 1 })
export const UPLOAD_BLOCKING_ERROR_CODES = [
  UploadErrorCodeEnum.ALL_FILES_INVALID,
  UploadErrorCodeEnum.ALBUM_ALREADY_EXISTS,
  UploadErrorCodeEnum.DISCOVERY_SERVICE_ERROR,
]
export const isItemUploadReady = (item: UploadItem): boolean => {
  const totalFiles = item.files.flat().length
  return (
    !!(item.discoverRes?.mbId || item.discoverRes?.discogsId) &&
    !!(item.manualCoverImgUrl || item.discoverRes?.coverUrl) &&
    !(item.errorCode && UPLOAD_BLOCKING_ERROR_CODES.includes(item.errorCode)) &&
    totalFiles > 0 &&
    !item.uploadRes
  )
}

/**
 * Call the admin discover endpoint to look up album information
 * Uses p-queue to limit concurrent requests to 3
 */
export async function discoverAlbum(metadata: DiscoverMetadata): Promise<AlbumLookupResult> {
  try {
    const response = await discoveryQueue.add(() =>
      adminApiClient.post<DiscoverResponse>('/api/admin/discover', {
        metadata: [metadata],
      })
    )

    const result = response.data.results[0]

    return {
      mbId: result.mbId,
      discogsId: result.discogsId || null,
      coverUrl: result.coverUrl || null,
      albumName: result.albumName,
      artistName: result.artistName,
      error: result.error,
      matchedBy: result.matchedBy,
    }
  } catch (error) {
    // Log error for debugging purposes

    console.error('Error discovering album:', error)
    return {
      mbId: null,
      discogsId: null,
      coverUrl: null,
      albumName: metadata.album,
      artistName: metadata.artist,
      error: UploadErrorCodeEnum.DISCOVERY_SERVICE_ERROR,
    }
  }
}

export async function uploadAlbum({
  mbId,
  albumCover,
  discogsId,
  discFiles,
}: {
  mbId: string
  albumCover: string
  discogsId: string
  discFiles: File[][]
}) {
  const formData = new FormData()

  // Add album metadata
  formData.append('mbId', mbId || '')
  formData.append('albumCover', albumCover || '')
  formData.append('discogsId', discogsId || '')

  // Add FLAC files only
  discFiles.forEach(disc => {
    disc.forEach(file => {
      formData.append(`files`, file)
    })
  })
  try {
    // Upload to API
    const res = await uploadQueue.add(() =>
      adminApiClient.post<AlbumUploadResponse>('/api/admin/upload-album', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    )
    return res.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data) {
      return error.response?.data as AlbumUploadResponse
    }
    throw error
  }
}
const isFlacFile = (file: File): boolean => {
  const fileName = file.name.toLowerCase()
  return fileName.endsWith('.flac')
}
const isAudioFile = (file: File): boolean => {
  return file.type.startsWith('audio/')
}
export const getAlbumsToUpload = (files: File[]) => {
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

  // Detect and group multi-disc albums (folders starting with "CD " or "Disc ")
  const multiDiscAlbumsMap = new Map<string, string[]>()
  const discFolderPaths = new Set<string>()

  for (const path of flacFolderMap.keys()) {
    const folderName = path.split('/').pop() || ''
    const parentPath = path.includes('/') ? path.substring(0, path.lastIndexOf('/')) : ''
    const parentFolderName = parentPath.split('/').pop() || ''

    // Case 1: Match child folders with disc indicators like "CD 1", "CD-1", "Disc 1", "Disc-1", etc.
    if (folderName.match(/.*(CD|Disc)\s*-?\s*\d+/i)) {
      discFolderPaths.add(path)
      if (!multiDiscAlbumsMap.has(parentPath)) {
        multiDiscAlbumsMap.set(parentPath, [])
      }
      multiDiscAlbumsMap.get(parentPath)!.push(path)
    }
    // Case 2: Check if parent folder has multi-disc indicator like "(2CD)", "(3CD)", etc.
    else if (parentPath && parentFolderName.match(/\((\d+)CD\)/i)) {
      // Check if there are sibling folders (other folders with the same parent)
      const siblingFolders = Array.from(flacFolderMap.keys()).filter(p => {
        const pParent = p.includes('/') ? p.substring(0, p.lastIndexOf('/')) : ''
        return pParent === parentPath && p !== path
      })

      // If there are sibling folders, treat this as a multi-disc album
      if (siblingFolders.length > 0) {
        discFolderPaths.add(path)
        if (!multiDiscAlbumsMap.has(parentPath)) {
          multiDiscAlbumsMap.set(parentPath, [])
        }
        if (!multiDiscAlbumsMap.get(parentPath)!.includes(path)) {
          multiDiscAlbumsMap.get(parentPath)!.push(path)
        }
      }
    }
  }

  // Filter out parent folders that have child folders in the list, excluding disc folders
  const allFolderPaths = Array.from(flacFolderMap.keys()).filter(path => !discFolderPaths.has(path))
  const filteredFolderPaths = allFolderPaths.filter(path => {
    // Keep this folder if no other folder in the list has it as a prefix (i.e., it's not a parent)
    return !allFolderPaths.some(otherPath => otherPath !== path && otherPath.startsWith(path + '/'))
  })

  // Create items for multi-disc albums
  for (const [parentPath, discPaths] of multiDiscAlbumsMap.entries()) {
    // Organize files by disc - each disc folder becomes an array
    const filesByDisc: File[][] = []
    let totalSize = 0

    // Sort disc paths to maintain disc order
    const sortedDiscPaths = discPaths.sort()

    for (const discPath of sortedDiscPaths) {
      const discFiles = flacFolderMap.get(discPath) || []
      filesByDisc.push(discFiles)
      totalSize += discFiles.reduce((sum, file) => sum + file.size, 0)
    }

    const albumName = parentPath ? parentPath.split('/').pop() || parentPath : 'Multi-Disc Album'

    // Check for skipped non-FLAC files across all disc folders
    let skippedCount = 0
    for (const discPath of discPaths) {
      const allFilesInFolder = allFolderMap.get(discPath) || []
      const flacFilesInFolder = flacFolderMap.get(discPath) || []
      skippedCount += allFilesInFolder.length - flacFilesInFolder.length
    }

    const newItem: UploadItem = {
      id: `${parentPath}-${albumName}`,
      name: albumName,
      type: 'folder',
      size: totalSize,
      files: filesByDisc,
      path: parentPath,
      metadata: null,
      errorCode: skippedCount > 0 ? UploadErrorCodeEnum.PARTIAL_UPLOAD : undefined,
      isLookingUp: true,
      loadingState: {
        status: 'loading',
      },
    }

    newItems.push(newItem)
  }

  // Create items for regular folders with FLAC files (excluding parent folders and disc folders)
  for (const path of filteredFolderPaths) {
    const folderFiles = flacFolderMap.get(path)!
    const totalSize = folderFiles.reduce((sum, file) => sum + file.size, 0)
    const folderName = path === 'root' ? 'Music Folder' : path.split('/').pop() || path

    // Check if this folder has non-FLAC files that were skipped
    const allFilesInFolder = allFolderMap.get(path) || []
    const skippedCount = allFilesInFolder.length - folderFiles.length

    const newItem: UploadItem = {
      id: `${path}-${folderName}`,
      name: folderName,
      type: 'folder',
      size: totalSize,
      files: [folderFiles], // Single disc album - wrap in array
      metadata: null,
      path,
      errorCode: skippedCount > 0 ? UploadErrorCodeEnum.PARTIAL_UPLOAD : undefined,
      isLookingUp: true, // Start lookup for all items with FLAC files
      loadingState: {
        status: 'loading',
      },
    }

    newItems.push(newItem)
  }

  // Create error items for folders with no FLAC files (excluding parent folders)
  const allFoldersWithoutFlac = Array.from(allFolderMap.keys()).filter(
    path => !flacFolderMap.has(path)
  )

  const filteredErrorFolderPaths = allFoldersWithoutFlac.filter(path => {
    // Keep this folder if no other folder in allFolderMap has it as a prefix
    return !Array.from(allFolderMap.keys()).some(
      otherPath => otherPath !== path && otherPath.startsWith(path + '/')
    )
  })

  filteredErrorFolderPaths.forEach(path => {
    const folderName = path === 'root' ? 'Music Folder' : path.split('/').pop() || path

    newItems.push({
      id: `${path}-${folderName}`,
      name: folderName,
      type: 'folder',
      size: 0,
      files: [],
      path,
      metadata: null,
      errorCode: UploadErrorCodeEnum.ALL_FILES_INVALID,
      loadingState: {
        status: 'error',
      },
    })
  })
  return newItems
}
export const formatMbId = (mbIdOrUrl: string): string => {
  if (mbIdOrUrl.includes('musicbrainz.org/release/')) {
    return mbIdOrUrl.split('/').pop()!.split('?')[0]
  }
  return mbIdOrUrl.trim()
}

export const formatDiscogsId = (discogsIdOrUrl: string) => {
  if (discogsIdOrUrl.includes('discogs.com/release/')) {
    return discogsIdOrUrl.split('discogs.com/release/').pop()!.split('-')[0]
  }
  return discogsIdOrUrl.trim()
}
