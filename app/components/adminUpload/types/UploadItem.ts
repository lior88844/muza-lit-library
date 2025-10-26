import type { SimpleFlacMetadata } from '../../../lib/utils/simpleFlacMetadata'
import type { AlbumUploadResponse } from './AlbumUploadResponse'
import type { AlbumLookupResult } from './DiscoverResponse'
import type { UploadErrorCodeEnum } from './ErrorCode'

export interface UploadItem {
  id: string
  name: string
  type: 'folder'
  size: number
  files: File[][] // Array of file arrays, each inner array represents a disc
  path: string
  errorCode?: UploadErrorCodeEnum // Optional error code
  metadata?: SimpleFlacMetadata // Extracted FLAC metadata
  discoverRes?: AlbumLookupResult // Backend lookup result
  uploadRes?: AlbumUploadResponse // Backend upload result
  isLookingUp?: boolean // Whether we're currently looking up the album
  manualAlbumId?: string // Manually entered album ID
  manualCoverImgUrl?: string // Cover image URL
  loadingState?: {
    status: 'loading' | 'loaded' | 'error'
  }
  // Validation states for upload
  isUploaded?: boolean // Whether album has been uploaded
}
