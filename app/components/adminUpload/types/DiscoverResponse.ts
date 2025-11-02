import type { UploadErrorCodeEnum } from './ErrorCode'

export interface DiscoverResponse {
  results: Array<{
    mbId: string | null
    discogsId: string | null
    coverUrl: string | null
    albumName?: string
    artistName?: string
    error?: UploadErrorCodeEnum
    matchedBy?: string
  }>
}
export type AlbumLookupResult = DiscoverResponse['results'][0]
