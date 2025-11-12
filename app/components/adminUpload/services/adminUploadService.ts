import AwsS3 from '@uppy/aws-s3'
import Uppy from '@uppy/core'
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
import { extractFullFileMetadata } from '~/lib/flacMetadata'

import type {
  FileUploadProgress,
  PrepareUploadResponse,
  SignedUrlInfo,
} from '../types/PrepareUploadResponse'

// Create a queue with max 3 concurrent requests
const discoveryQueue = new PQueue({ concurrency: 3 })
export const prepareQueue = new PQueue({ concurrency: 3 })

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
    (item.phase === 'idle' || item.phase === 'error')
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
      phase: 'discovering',
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
      phase: 'discovering',
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
      phase: 'error',
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

/**
 * Prepare album upload by extracting metadata and sending to backend
 * Backend will aggregate data, create entities, and return signed URLs
 * This is step 1 of the new two-step upload process
 */
export async function prepareAlbumUpload({
  mbId,
  albumCover,
  discogsId,
  discFiles,
}: {
  mbId: string
  albumCover: string
  discogsId: string
  discFiles: File[][]
}): Promise<PrepareUploadResponse> {
  try {
    // Extract metadata from all files
    const allFiles = discFiles.flat()
    const fileMetadataResults = await Promise.all(
      allFiles.map(file => extractFullFileMetadata(file))
    )

    // Filter out any null results (files that failed metadata extraction)
    const fileMetadata = fileMetadataResults.filter(metadata => metadata !== null) as NonNullable<
      (typeof fileMetadataResults)[0]
    >[]

    if (fileMetadata.length === 0) {
      return {
        success: false,
        message: 'Failed to extract metadata from any files',
        trackUploads: [],
        errors: [UploadErrorCodeEnum.DISCOVERY_SERVICE_ERROR],
      }
    }

    // Send to backend
    const response = await adminApiClient.post<PrepareUploadResponse>('/api/admin/prepare-upload', {
      mbId: mbId || undefined,
      discogsId: discogsId ? parseInt(discogsId) : undefined,
      albumCover: albumCover || undefined,
      fileMetadata,
    })

    return response.data
  } catch (error) {
    console.error('Error preparing album upload:', error)
    if (error instanceof AxiosError && error.response?.data) {
      return error.response.data as PrepareUploadResponse
    }
    return {
      success: false,
      message: 'Failed to prepare album upload',
      trackUploads: [],
      errors: [UploadErrorCodeEnum.UPLOAD_SERVICE_ERROR],
    }
  }
}

/**
 * Upload files to S3 using presigned URLs with Uppy AWS S3 plugin
 * This is step 2 of the new two-step upload process
 */
export async function uploadFilesToS3(
  trackUploads: SignedUrlInfo[],
  files: File[][],
  onProgress?: (fileName: string, progress: FileUploadProgress) => void
): Promise<{
  success: boolean
  uploadedFiles: Array<{ fileName: string; trackId: number; fileId: string }>
  errors: Array<{ fileName: string; error: string }>
}> {
  const allFiles = files.flat()
  const uploadedFiles: Array<{ fileName: string; trackId: number; fileId: string }> = []
  const errors: Array<{ fileName: string; error: string }> = []

  // Create a map of fileName to trackUpload info
  const fileNameToTrackUpload = new Map<string, SignedUrlInfo>()
  trackUploads.forEach(track => {
    fileNameToTrackUpload.set(track.fileName, track)
  })

  // Upload files one by one using Uppy with AWS S3 plugin
  for (const file of allFiles) {
    const trackUpload = fileNameToTrackUpload.get(file.name)

    if (!trackUpload) {
      errors.push({
        fileName: file.name,
        error: 'No signed URL found for this file',
      })
      continue
    }

    try {
      // Update progress: pending -> uploading
      onProgress?.(file.name, {
        fileName: file.name,
        progress: 0,
        status: 'uploading',
      })

      // Create Uppy instance for this file
      const uppy = new Uppy({
        autoProceed: false,
        allowMultipleUploadBatches: false,
        restrictions: {
          maxNumberOfFiles: 1,
        },
      })

      // Configure AWS S3 upload with presigned URL
      uppy.use(AwsS3, {
        shouldUseMultipart: false, // We're using single presigned URLs, not multipart
        getUploadParameters: file => {
          // Return the presigned URL and headers for this file
          return Promise.resolve({
            method: 'PUT',
            url: trackUpload.signedUrl,
            headers: {
              'Content-Type': file.type || 'audio/flac',
            },
          })
        },
      })

      // Track upload progress
      uppy.on('upload-progress', (uppyFile, progress) => {
        if (progress.bytesTotal && uppyFile && uppyFile.name) {
          const percentage = Math.round((progress.bytesUploaded / progress.bytesTotal) * 100)
          onProgress?.(uppyFile.name, {
            fileName: uppyFile.name,
            progress: percentage,
            status: 'uploading',
          })
        }
      })

      // Add file to Uppy
      uppy.addFile({
        name: file.name,
        type: file.type,
        data: file,
      })

      // Start upload
      const result = await uppy.upload()

      if (result && result.failed && result.failed.length > 0) {
        throw new Error(`Upload failed: ${result.failed[0].error}`)
      }

      // Update progress: completed
      onProgress?.(file.name, {
        fileName: file.name,
        progress: 100,
        status: 'completed',
      })

      uploadedFiles.push({
        fileName: file.name,
        trackId: trackUpload.trackId,
        fileId: trackUpload.fileId,
      })

      // Clean up Uppy instance
      uppy.cancelAll()
      uppy.clear()
    } catch (error) {
      console.error(`Error uploading ${file.name}:`, error)

      onProgress?.(file.name, {
        fileName: file.name,
        progress: 0,
        status: 'error',
        error: error instanceof Error ? error.message : 'Upload failed',
      })

      errors.push({
        fileName: file.name,
        error: error instanceof Error ? error.message : 'Upload failed',
      })
    }
  }

  return {
    success: errors.length === 0,
    uploadedFiles,
    errors,
  }
}
