import type { Album } from '../../../db/album.entity'
import type { AlbumArtist } from '../../../db/album-artist.entity'
import type { Artist } from '../../../db/artist.entity'
import type { TrackResponse } from '../../track/types/TrackResponse'

export type AlbumResponse = Album & {
  artist: Artist & AlbumArtist
  tracks: TrackResponse[]
  otherArtists: (Artist & AlbumArtist)[]
}
