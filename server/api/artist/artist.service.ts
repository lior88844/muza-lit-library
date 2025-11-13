import { eq } from 'drizzle-orm'

import type { AlbumArtist } from '../../db/album-artist.entity'
import { type Artist, artists } from '../../db/artist.entity'
import { db } from '../../db/connection'
import type { ArtistMiniResponse, ArtistResponse } from './types/ArtistResponse'

// Types for transformed data
export interface ArtistWithAlbums extends Artist {
  albumArtists: AlbumArtist[]
}

export async function findArtistById(id: number): Promise<ArtistResponse> {
  const artist = await db.query.artists.findFirst({
    where: eq(artists.id, id),
    with: {
      albumArtists: true,
    },
  })

  return artist as ArtistResponse
}

/**
 * Find many artists with pagination
 */
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
