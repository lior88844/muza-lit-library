import type { PlaylistVisibilityEnum } from '../../../db/playlist.entity'
import type { TrackResponse } from '../../track/types/TrackResponse'

export interface MiniPlaylistResponse {
  id: number
  title: string
  author?: string
  imageSrc?: string
  description?: string
  createdAt: Date
  trackCount: number
  popularity?: number
  visibility: PlaylistVisibilityEnum
  songs: TrackResponse[]
}
