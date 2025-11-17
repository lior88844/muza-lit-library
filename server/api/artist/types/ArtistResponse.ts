import type { Album } from 'server/db/album.entity'
import type { AlbumArtist } from 'server/db/album-artist.entity'
import type { Artist } from 'server/db/artist.entity'

export interface ArtistWithAlbums extends Artist {
  albumArtists: AlbumArtist[]
}

export type AlbumArtistWithAlbumAndTracks = AlbumArtist & {
  album: {
    id: number
    title: string
    coverArt: string | null
    releaseDate: Date | null
    tracks: { id: number }[]
  }
}

export type ArtistAlbumWithDetails = AlbumArtist & {
  album: Album & {
    tracks: { id: number }[]
    albumArtists?: (AlbumArtist & { artist: Artist })[]
  }
}

export type AlbumArtistFormatted = AlbumArtist & { artist: Artist }

export interface ArtistMiniResponse {
  id: number
  imageUrl: string | null
  name: string
  albumsCount: number
}

export interface ArtistResponse extends Artist {
  albumArtists: AlbumArtist[]
}
