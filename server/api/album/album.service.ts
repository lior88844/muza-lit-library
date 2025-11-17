import { desc } from 'drizzle-orm'

import { albums } from '../../db/album.entity'
import type { AlbumArtist } from '../../db/album-artist.entity'
import type { Artist } from '../../db/artist.entity'
import { db } from '../../db/connection'
import { formatTrack } from '../track/track.service'
import type {
  AlbumLabelWithLabel,
  AlbumResponse,
  AlbumWithArtistsAndTracks,
  LabelResponse,
} from './types/AlbumResponse'
import type { MiniAlbum } from './types/MiniAlbumResponse'

/**
 * Find many albums with pagination
 */
export async function findManyAlbums(limit = 20, offset = 0) {
  const albumsResult = await db.query.albums.findMany({
    limit,
    offset,
    with: {
      albumArtists: { with: { artist: true } },
      tracks: { columns: { id: true } },
    },
    orderBy: desc(albums.createdAt),
  })

  return {
    albums: formatMiniAlbum(albumsResult as AlbumWithArtistsAndTracks[]),
  }
}

export async function findAlbumById(id: number) {
  const albumResult = await db.query.albums.findFirst({
    where: (albums, { eq }) => eq(albums.id, id),
    with: {
      albumArtists: {
        with: { artist: true },
        orderBy: (albumArtists, { asc }) => [asc(albumArtists.order)],
      },
      tracks: {
        with: {
          trackArtists: { with: { artist: true } },
        },
        orderBy: (tracks, { asc }) => [asc(tracks.trackNumber)],
      },
      albumLabels: {
        with: { label: true },
        orderBy: (albumLabels, { asc }) => [asc(albumLabels.order)],
      },
    },
  })

  if (!albumResult) {
    return null
  }
  return formatAlbum(albumResult)
}

export function toMiniAlbum(
  album: {
    id: number
    title: string
    coverArt: string | null
    releaseDate: Date | null
    tracks: Array<{ id: number }>
  },
  artist: { name?: string; id?: number }
): MiniAlbum {
  return {
    id: album.id,
    imageSrc: album.coverArt || '',
    title: album.title,
    releaseDate: album.releaseDate,
    artist: artist.name ?? '',
    artistId: artist.id ?? 0,
    songs: album.tracks.map(track => track.id),
  }
}

export function formatMiniAlbum(albums: AlbumWithArtistsAndTracks[]): MiniAlbum[] {
  return albums.map(album => {
    const mainArtist = album.albumArtists[0]

    return toMiniAlbum(album, {
      name: mainArtist?.artist.name,
      id: mainArtist?.artist.id,
    })
  })
}

export function formatAlbum(album: AlbumWithArtistsAndTracks): AlbumResponse {
  return {
    ...album,
    artist: formatAlbumArtist(album.albumArtists[0]),
    otherArtists: album.albumArtists.slice(1).map(formatAlbumArtist),
    tracks: album.tracks.map(track => formatTrack({ ...track, album: album })),
    labels: (album.albumLabels || []).map(formatAlbumLabel),
  }
}

const formatAlbumArtist = (albumArtist: AlbumArtist & { artist: Artist }) => {
  return {
    ...albumArtist,
    ...albumArtist.artist,
    artist: undefined,
  }
}

const formatAlbumLabel = (albumLabel: AlbumLabelWithLabel): LabelResponse => {
  return {
    ...albumLabel.label,
    catalogNumber: albumLabel.catalogNumber,
    order: albumLabel.order,
  }
}
