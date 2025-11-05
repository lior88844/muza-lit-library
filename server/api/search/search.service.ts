import { ilike, or } from 'drizzle-orm'

import { albums } from '../../db/album.entity'
import { artists } from '../../db/artist.entity'
import { db } from '../../db/connection'
import { tracks } from '../../db/track.entity'
import { type AlbumWithArtistsAndTracks, formatMiniAlbum } from '../album/album.service'
import type { MiniAlbum } from '../album/types/MiniAlbumResponse'
import { type ArtistWithAlbums, transformArtistData } from '../artist/artist.service'
import type { ArtistMiniResponse } from '../artist/types/ArtistResponse'
import { formatTrack } from '../track/track.service'

export interface SearchResults {
  albums: MiniAlbum[]
  artists: ArtistMiniResponse[]
  tracks: Array<ReturnType<typeof formatTrack>>
  total: number
}

export async function searchAll(query: string, limit = 20, offset = 0): Promise<SearchResults> {
  const searchTerm = `%${query}%`

  // Search albums
  const albumsResult = await db.query.albums.findMany({
    where: or(
      ilike(albums.title, searchTerm),
      ilike(albums.sortTitle, searchTerm),
      ilike(albums.disambiguation, searchTerm)
    ),
    limit: Math.ceil(limit / 3),
    offset: Math.ceil(offset / 3),
    with: {
      albumArtists: { with: { artist: true } },
      tracks: { columns: { id: true } },
    },
    orderBy: (albums, { desc }) => [desc(albums.createdAt)],
  })

  // Search artists
  const artistsResult = await db.query.artists.findMany({
    where: or(
      ilike(artists.name, searchTerm),
      ilike(artists.sortName, searchTerm),
      ilike(artists.disambiguation, searchTerm)
    ),
    limit: Math.ceil(limit / 3),
    offset: Math.ceil(offset / 3),
    with: {
      albumArtists: true,
    },
  })

  // Search tracks
  const tracksResult = await db.query.tracks.findMany({
    where: or(
      ilike(tracks.title, searchTerm),
      ilike(tracks.sortTitle, searchTerm),
      ilike(tracks.disambiguation, searchTerm)
    ),
    limit: Math.ceil(limit / 3),
    offset: Math.ceil(offset / 3),
    with: {
      album: true,
      trackArtists: { with: { artist: true } },
    },
    orderBy: (tracks, { desc }) => [desc(tracks.createdAt)],
  })

  return {
    albums: formatMiniAlbum(albumsResult as AlbumWithArtistsAndTracks[]),
    artists: transformArtistData(artistsResult as ArtistWithAlbums[]),
    tracks: tracksResult.map(formatTrack),
    total: albumsResult.length + artistsResult.length + tracksResult.length,
  }
}
