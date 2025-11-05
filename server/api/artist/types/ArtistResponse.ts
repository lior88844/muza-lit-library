import type { AlbumArtist } from 'server/db/album-artist.entity'
import type { Artist } from 'server/db/artist.entity'

export interface ArtistMiniResponse {
  id: number
  imageUrl: string | null
  name: string
  albumsCount: number
}

export interface ArtistResponse extends Artist {
  albumArtists: AlbumArtist[]
}
