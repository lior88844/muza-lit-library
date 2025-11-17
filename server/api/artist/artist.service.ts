import { eq } from 'drizzle-orm'

import { artists } from '../../db/artist.entity'
import { db } from '../../db/connection'
import type { AlbumResponse } from '../album/types/AlbumResponse'
import type {
  AlbumArtistFormatted,
  ArtistAlbumWithDetails,
  ArtistMiniResponse,
  ArtistWithAlbums,
} from './types/ArtistResponse'

export async function findArtistById(id: number) {
  const artist = await db.query.artists.findFirst({
    where: eq(artists.id, id),
    with: {
      albumArtists: {
        with: {
          album: {
            with: {
              tracks: {
                columns: {
                  id: true,
                },
              },
              albumArtists: {
                with: {
                  artist: true,
                },
                orderBy: (albumArtists, { asc }) => [asc(albumArtists.order)],
              },
            },
          },
        },
        orderBy: (albumArtists, { asc }) => [asc(albumArtists.order)],
      },
    },
  })

  return artist
}

export async function findManyArtists(limit = 20, offset = 0) {
  const artistsResult = await db.query.artists.findMany({
    with: {
      albumArtists: true,
    },
    limit,
    offset,
  })
  return {
    artists: formatArtist(artistsResult as ArtistWithAlbums[]),
  }
}

/**
 * Transform artist data for frontend consumption
 */
export function formatArtist(artists: ArtistWithAlbums[]): ArtistMiniResponse[] {
  return artists
    .filter(artist => artist.name)
    .map(artist => ({
      id: artist.id,
      imageUrl: artist.image,
      name: artist.name,
      albumsCount: artist.albumArtists.length,
    }))
}

export function formatArtistAlbum(albumArtist: ArtistAlbumWithDetails): AlbumResponse {
  const { album } = albumArtist

  const formatAlbumArtist = (aa: AlbumArtistFormatted) => ({
    ...aa,
    ...aa.artist,
    artist: undefined,
  })

  if (!album.albumArtists || album.albumArtists.length === 0) {
    throw new Error('Album must have at least one artist')
  }

  const mainArtist = formatAlbumArtist(album.albumArtists[0])
  const otherArtists = album.albumArtists.slice(1).map(formatAlbumArtist)

  return {
    ...album,
    artist: mainArtist,
    otherArtists,
    tracks: [],
    labels: [],
  } as AlbumResponse
}
