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
  const flacFiles = filesToHandle.filter(isFlacFile)

  const allFolderMap = new Map<string, File[]>()
  const flacFolderMap = new Map<string, File[]>()

  filesToHandle.forEach(file => {
    const path = file.webkitRelativePath || file.name
    const folderPath = path.includes('/') ? path.substring(0, path.lastIndexOf('/')) : 'root'

    if (!allFolderMap.has(folderPath)) {
      allFolderMap.set(folderPath, [])
    }
    allFolderMap.get(folderPath)!.push(file)
  })

  flacFiles.forEach(file => {
    const path = file.webkitRelativePath || file.name
    const folderPath = path.includes('/') ? path.substring(0, path.lastIndexOf('/')) : 'root'

    if (!flacFolderMap.has(folderPath)) {
      flacFolderMap.set(folderPath, [])
    }
    flacFolderMap.get(folderPath)!.push(file)
  })

  const multiDiscAlbumsMap = new Map<string, string[]>()
  const discFolderPaths = new Set<string>()

  for (const path of flacFolderMap.keys()) {
    const folderName = path.split('/').pop() || ''
    const parentPath = path.includes('/') ? path.substring(0, path.lastIndexOf('/')) : ''
    const parentFolderName = parentPath.split('/').pop() || ''

    if (folderName.match(/.*(CD|Disc)\s*-?\s*\d+/i)) {
      discFolderPaths.add(path)
      if (!multiDiscAlbumsMap.has(parentPath)) {
        multiDiscAlbumsMap.set(parentPath, [])
      }
      multiDiscAlbumsMap.get(parentPath)!.push(path)
    } else if (parentPath && parentFolderName.match(/\((\d+)CD\)/i)) {
      const siblingFolders = Array.from(flacFolderMap.keys()).filter(p => {
        const pParent = p.includes('/') ? p.substring(0, p.lastIndexOf('/')) : ''
        return pParent === parentPath && p !== path
      })

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

  const allFolderPaths = Array.from(flacFolderMap.keys()).filter(path => !discFolderPaths.has(path))
  const filteredFolderPaths = allFolderPaths.filter(path => {
    return !allFolderPaths.some(otherPath => otherPath !== path && otherPath.startsWith(path + '/'))
  })

  for (const [parentPath, discPaths] of multiDiscAlbumsMap.entries()) {
    const filesByDisc: File[][] = []
    let totalSize = 0

    const sortedDiscPaths = discPaths.sort()

    for (const discPath of sortedDiscPaths) {
      const discFiles = flacFolderMap.get(discPath) || []
      filesByDisc.push(discFiles)
      totalSize += discFiles.reduce((sum, file) => sum + file.size, 0)
    }

    const albumName = parentPath ? parentPath.split('/').pop() || parentPath : 'Multi-Disc Album'

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

  for (const path of filteredFolderPaths) {
    const folderFiles = flacFolderMap.get(path)!
    const totalSize = folderFiles.reduce((sum, file) => sum + file.size, 0)
    const folderName = path === 'root' ? 'Music Folder' : path.split('/').pop() || path

    const allFilesInFolder = allFolderMap.get(path) || []
    const skippedCount = allFilesInFolder.length - folderFiles.length

    const newItem: UploadItem = {
      id: `${path}-${folderName}`,
      name: folderName,
      type: 'folder',
      size: totalSize,
      files: [folderFiles],
      metadata: null,
      path,
      errorCode: skippedCount > 0 ? UploadErrorCodeEnum.PARTIAL_UPLOAD : undefined,
      phase: 'discovering',
    }

    newItems.push(newItem)
  }

  const allFoldersWithoutFlac = Array.from(allFolderMap.keys()).filter(
    path => !flacFolderMap.has(path)
  )

  const filteredErrorFolderPaths = allFoldersWithoutFlac.filter(path => {
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
    const allFiles = discFiles.flat()
    const fileMetadataResults = await Promise.all(
      allFiles.map(file => extractFullFileMetadata(file))
    )

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

  const fileNameToTrackUpload = new Map<string, SignedUrlInfo>()
  trackUploads.forEach(track => {
    fileNameToTrackUpload.set(track.fileName, track)
  })

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
      onProgress?.(file.name, {
        fileName: file.name,
        progress: 0,
        status: 'uploading',
      })

      const uppy = new Uppy({
        autoProceed: false,
        allowMultipleUploadBatches: false,
        restrictions: {
          maxNumberOfFiles: 1,
        },
      })

      uppy.use(AwsS3, {
        shouldUseMultipart: false,
        getUploadParameters: file => {
          return Promise.resolve({
            method: 'PUT',
            url: trackUpload.signedUrl,
            headers: {
              'Content-Type': file.type || 'audio/flac',
            },
          })
        },
      })

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

      uppy.addFile({
        name: file.name,
        type: file.type,
        data: file,
      })

      const result = await uppy.upload()

      if (result && result.failed && result.failed.length > 0) {
        throw new Error(`Upload failed: ${result.failed[0].error}`)
      }

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
