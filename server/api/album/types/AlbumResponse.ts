import type { TrackWithArtists } from 'server/api/track/types/TrackWithArtists'
import type { AlbumLabel } from 'server/db/album-label.entity'

import type { Album } from '../../../db/album.entity'
import type { AlbumArtist } from '../../../db/album-artist.entity'
import type { Artist } from '../../../db/artist.entity'
import type { Label } from '../../../db/label.entity'
import type { TrackResponse } from '../../track/types/TrackResponse'

export interface AlbumLabelWithLabel extends AlbumLabel {
  label: Label
}

export interface AlbumWithArtistsAndTracks extends Album {
  albumArtists: (AlbumArtist & { artist: Artist })[]
  tracks: Omit<TrackWithArtists, 'album'>[]
  albumLabels?: AlbumLabelWithLabel[]
}

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
