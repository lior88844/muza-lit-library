import type { Album } from '../../../db/album.entity'
import type { AlbumArtist } from '../../../db/album-artist.entity'
import type { Artist } from '../../../db/artist.entity'
import type { Label } from '../../../db/label.entity'
import type { TrackResponse } from '../../track/types/TrackResponse'
export interface LabelResponse extends Label {
  catalogNumber: string | null
  order: number
}
export type AlbumResponse = Album & {
  artist: Artist & AlbumArtist
  tracks: TrackResponse[]
  otherArtists: (Artist & AlbumArtist)[]
  labels?: LabelResponse[]
}
