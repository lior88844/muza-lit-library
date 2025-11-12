export interface SignedUrlInfo {
  trackId: number
  trackTitle: string
  trackNumber?: number
  discNumber?: number
  signedUrl: string
  fileId: string
  fileName: string
  expiresAt: string
  matchedBy: 'filename' | 'metadata' | 'position' | 'none'
  matchConfidence: number
}

export interface PrepareUploadResponse {
  success: boolean
  message: string
  album?: any
  trackUploads: SignedUrlInfo[]
  errors?: number[]
}

export interface FileUploadProgress {
  fileName: string
  progress: number // 0-100
  status: 'pending' | 'uploading' | 'completed' | 'error'
  error?: string
}
