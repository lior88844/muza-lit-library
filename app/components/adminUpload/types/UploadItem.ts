import type { DiscoverMetadata } from '~/lib/flacMetadata'

import type { AlbumLookupResult } from './DiscoverResponse'
import type { UploadErrorCodeEnum } from './ErrorCode'
import type { FileUploadProgress, PrepareUploadResponse } from './PrepareUploadResponse'

export type UploadPhase =
  | 'idle'
  | 'discovering'
  | 'waiting'
  | 'preparing'
  | 'uploading'
  | 'completed'
  | 'error'

export interface UploadItem {
  id: string
  name: string
  type: 'folder'
  size: number
  files: File[][] // Array of file arrays, each inner array represents a disc
  path: string
  phase: UploadPhase
  metadata: DiscoverMetadata | null // Extracted FLAC metadata
  discoverRes?: AlbumLookupResult // Backend lookup result
  manualAlbumId?: string // Manually entered album ID
  manualDiscogsId?: string // Manually entered Discogs ID
  manualCoverImgUrl?: string // Cover image URL
  prepareRes?: PrepareUploadResponse // Prepare upload response with signed URLs
  uploadProgress?: Map<string, FileUploadProgress> // Map of fileName to upload progress
  uploadErrors?: string[] // Array of error messages from S3 uploads
  errorCode?: UploadErrorCodeEnum // Optional error code
}
