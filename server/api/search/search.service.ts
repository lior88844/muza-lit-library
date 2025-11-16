import { and, asc, eq, sql } from 'drizzle-orm'

import { albums } from '../../db/album.entity'
import { artists } from '../../db/artist.entity'
import { db } from '../../db/connection'
import { playlists, PlaylistVisibilityEnum } from '../../db/playlist.entity'
import { playlistTracks } from '../../db/playlist-tracks.entity'
import { tracks } from '../../db/track.entity'
import { formatAlbum } from '../album/album.service'
import type { AlbumResponse } from '../album/types/AlbumResponse'
import { type ArtistWithAlbums, formatArtist } from '../artist/artist.service'
import type { ArtistMiniResponse } from '../artist/types/ArtistResponse'
import { formatMiniPlaylist } from '../playlist/playlist.service'
import type { PlaylistResponse } from '../playlist/types/MiniPlaylistResponse'
import { formatTrack } from '../track/track.service'

export interface SearchResults {
  albums: (AlbumResponse & { relevanceScore?: number })[]
  artists: (ArtistMiniResponse & { relevanceScore?: number })[]
  tracks: (ReturnType<typeof formatTrack> & { relevanceScore?: number })[]
  playlists: (PlaylistResponse & { relevanceScore?: number })[]
  total: number
}

export interface AutocompleteResult {
  id: string
  type: 'album' | 'artist' | 'track' | 'playlist'
  title: string
  subtitle?: string
  imageUrl?: string | null
  relevanceScore?: number
}

export interface AutocompleteResults {
  results: AutocompleteResult[]
}

// Scoring weights
const SIMILARITY_WEIGHT = 0.7
const POPULARITY_WEIGHT = 0.2
const ARTIST_MATCH_WEIGHT = 0.1
const SIMILARITY_THRESHOLD = 0.2 // Minimum similarity to consider a match

export async function searchAll(query: string, limit = 20, offset = 0): Promise<SearchResults> {
  const searchTerm = query.trim().toLowerCase()
  const perCategoryLimit = Math.ceil(limit / 4)

  // PHASE 1: Find matching artists with similarity scores
  const matchedArtists = await db
    .select({
      id: artists.id,
      name: artists.name,
      sortName: artists.sortName,
      disambiguation: artists.disambiguation,
      image: artists.image,
      popularity: artists.popularity,
      createdAt: artists.createdAt,
      similarity: sql<number>`GREATEST(
        similarity(LOWER(${artists.name}), ${searchTerm}),
        COALESCE(similarity(LOWER(${artists.sortName}), ${searchTerm}), 0),
        COALESCE(similarity(LOWER(${artists.disambiguation}), ${searchTerm}), 0)
      )`,
    })
    .from(artists)
    .where(
      sql`GREATEST(
        similarity(LOWER(${artists.name}), ${searchTerm}),
        COALESCE(similarity(LOWER(${artists.sortName}), ${searchTerm}), 0),
        COALESCE(similarity(LOWER(${artists.disambiguation}), ${searchTerm}), 0)
      ) > ${SIMILARITY_THRESHOLD}`
    )
    .limit(perCategoryLimit * 2) // Get more to account for filtering

  const matchedArtistIds = new Set(matchedArtists.map(a => a.id))
  const artistScoreMap = new Map(matchedArtists.map(a => [a.id, a.similarity]))

  // PHASE 2: Search albums with similarity scoring and artist boosting
  const albumsResult = await db.query.albums.findMany({
    where: sql`GREATEST(
      similarity(LOWER(${albums.title}), ${searchTerm}),
      COALESCE(similarity(LOWER(${albums.sortTitle}), ${searchTerm}), 0),
      COALESCE(similarity(LOWER(${albums.disambiguation}), ${searchTerm}), 0)
    ) > ${SIMILARITY_THRESHOLD}`,
    limit: perCategoryLimit * 3, // Get extra for scoring/filtering
    with: {
      albumArtists: { with: { artist: true } },
      tracks: { with: { trackArtists: { with: { artist: true } } } },
    },
  })

  // Calculate album scores
  const albumsWithScores = await Promise.all(
    albumsResult.map(async album => {
      // Calculate base similarity
      const titleSim = await calculateSimilarity(album.title, searchTerm)
      const sortTitleSim = album.sortTitle
        ? await calculateSimilarity(album.sortTitle, searchTerm)
        : 0
      const disambigSim = album.disambiguation
        ? await calculateSimilarity(album.disambiguation, searchTerm)
        : 0
      const baseSimilarity = Math.max(titleSim, sortTitleSim, disambigSim)

      // Check if album belongs to matched artist
      const hasMatchedArtist = album.albumArtists.some(aa => matchedArtistIds.has(aa.artistId))
      const artistBoost = hasMatchedArtist
        ? Math.max(...album.albumArtists.map(aa => artistScoreMap.get(aa.artistId) || 0))
        : 0

      // Calculate composite score
      const popularityScore = Math.min((album.popularity || 0) / 10000, 1)

      const relevanceScore =
        baseSimilarity * SIMILARITY_WEIGHT +
        popularityScore * POPULARITY_WEIGHT +
        artistBoost * ARTIST_MATCH_WEIGHT

      return { album, relevanceScore }
    })
  )

  // PHASE 3: Search tracks with similarity scoring and artist boosting
  const tracksResult = await db.query.tracks.findMany({
    where: sql`GREATEST(
      similarity(LOWER(${tracks.title}), ${searchTerm}),
      COALESCE(similarity(LOWER(${tracks.sortTitle}), ${searchTerm}), 0),
      COALESCE(similarity(LOWER(${tracks.disambiguation}), ${searchTerm}), 0)
    ) > ${SIMILARITY_THRESHOLD}`,
    limit: perCategoryLimit * 3,
    with: {
      album: true,
      trackArtists: { with: { artist: true } },
    },
  })

  // Calculate track scores
  const tracksWithScores = await Promise.all(
    tracksResult.map(async track => {
      // Calculate base similarity
      const titleSim = await calculateSimilarity(track.title, searchTerm)
      const sortTitleSim = track.sortTitle
        ? await calculateSimilarity(track.sortTitle, searchTerm)
        : 0
      const disambigSim = track.disambiguation
        ? await calculateSimilarity(track.disambiguation, searchTerm)
        : 0
      const baseSimilarity = Math.max(titleSim, sortTitleSim, disambigSim)

      // Check if track belongs to matched artist
      const hasMatchedArtist = track.trackArtists.some(ta => matchedArtistIds.has(ta.artistId))
      const artistBoost = hasMatchedArtist
        ? Math.max(...track.trackArtists.map(ta => artistScoreMap.get(ta.artistId) || 0))
        : 0

      // Calculate composite score
      const popularityScore = Math.min((track.popularity || 0) / 10000, 1)

      const relevanceScore =
        baseSimilarity * SIMILARITY_WEIGHT +
        popularityScore * POPULARITY_WEIGHT +
        artistBoost * ARTIST_MATCH_WEIGHT

      return { track, relevanceScore }
    })
  )

  // PHASE 4: Search playlists with similarity scoring
  const playlistsResult = await db.query.playlists.findMany({
    where: and(
      eq(playlists.visibility, PlaylistVisibilityEnum.Public),
      sql`GREATEST(
        similarity(LOWER(${playlists.name}), ${searchTerm}),
        COALESCE(similarity(LOWER(${playlists.description}), ${searchTerm}), 0)
      ) > ${SIMILARITY_THRESHOLD}`
    ),
    limit: perCategoryLimit * 2,
    with: {
      tracks: {
        orderBy: asc(playlistTracks.position),
        with: {
          track: {
            with: {
              trackArtists: { with: { artist: true } },
              album: true,
            },
          },
        },
      },
    },
  })

  // Calculate playlist scores
  const playlistsWithScores = await Promise.all(
    playlistsResult.map(async playlist => {
      const nameSim = await calculateSimilarity(playlist.name, searchTerm)
      const descSim = playlist.description
        ? await calculateSimilarity(playlist.description, searchTerm)
        : 0
      const baseSimilarity = Math.max(nameSim, descSim)

      const popularityScore = Math.min((playlist.popularity || 0) / 10000, 1)

      const relevanceScore =
        baseSimilarity * (SIMILARITY_WEIGHT + ARTIST_MATCH_WEIGHT) + // No artist boost for playlists
        popularityScore * POPULARITY_WEIGHT

      return { playlist, relevanceScore }
    })
  )

  // Calculate artist scores
  const artistsWithScores = matchedArtists.map(artist => {
    const popularityScore = Math.min((artist.popularity || 0) / 10000, 1)

    const relevanceScore =
      artist.similarity * (SIMILARITY_WEIGHT + ARTIST_MATCH_WEIGHT) + // Artists get full weight
      popularityScore * POPULARITY_WEIGHT

    return { artist, relevanceScore }
  })

  // Sort and limit results by relevance score
  const sortedAlbums = albumsWithScores
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(offset, offset + perCategoryLimit)
    .map(({ album, relevanceScore }) => ({ ...formatAlbum(album), relevanceScore }))

  const sortedTracks = tracksWithScores
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(offset, offset + perCategoryLimit)
    .map(({ track, relevanceScore }) => ({ ...formatTrack(track), relevanceScore }))

  const sortedPlaylists = playlistsWithScores
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(offset, offset + perCategoryLimit)
    .map(({ playlist, relevanceScore }) => ({
      ...(formatMiniPlaylist(playlist) as PlaylistResponse),
      relevanceScore,
    }))

  // Format artists with album counts
  const artistsWithAlbumData = await Promise.all(
    artistsWithScores
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(offset, offset + perCategoryLimit)
      .map(async ({ artist, relevanceScore }) => {
        const artistWithAlbums = await db.query.artists.findFirst({
          where: eq(artists.id, artist.id),
          with: { albumArtists: true },
        })
        return {
          ...formatArtist([artistWithAlbums as ArtistWithAlbums])[0],
          relevanceScore,
        }
      })
  )

  return {
    albums: sortedAlbums,
    artists: artistsWithAlbumData,
    tracks: sortedTracks,
    playlists: sortedPlaylists,
    total:
      sortedAlbums.length +
      artistsWithAlbumData.length +
      sortedTracks.length +
      sortedPlaylists.length,
  }
}

// Helper function to calculate similarity (fallback for when SQL isn't available in context)
async function calculateSimilarity(text: string, searchTerm: string): Promise<number> {
  if (!text) return 0
  const result = await db.execute(
    sql`SELECT similarity(LOWER(${text}), ${searchTerm.toLowerCase()}) as sim`
  )
  return (result[0] as { sim: number }).sim
}

export async function searchAutocomplete(query: string, limit = 15): Promise<AutocompleteResults> {
  const searchTerm = query.trim().toLowerCase()
  const perCategoryLimit = Math.ceil(limit / 4) // ~3-4 per category

  // Lightweight scoring for autocomplete (skip recency, focus on similarity + popularity)
  const AUTOCOMPLETE_SIM_WEIGHT = 0.7
  const AUTOCOMPLETE_POP_WEIGHT = 0.3
  const AUTOCOMPLETE_THRESHOLD = 0.15 // Lower threshold for autocomplete

  // Search artists
  const artistsResult = await db
    .select({
      id: artists.id,
      name: artists.name,
      image: artists.image,
      popularity: artists.popularity,
      similarity: sql<number>`GREATEST(
        similarity(LOWER(${artists.name}), ${searchTerm}),
        COALESCE(similarity(LOWER(${artists.sortName}), ${searchTerm}), 0)
      )`,
    })
    .from(artists)
    .where(
      sql`GREATEST(
        similarity(LOWER(${artists.name}), ${searchTerm}),
        COALESCE(similarity(LOWER(${artists.sortName}), ${searchTerm}), 0)
      ) > ${AUTOCOMPLETE_THRESHOLD}`
    )
    .limit(perCategoryLimit * 2)

  const matchedArtistIds = new Set(artistsResult.map(a => a.id))
  const artistScoreMap = new Map(artistsResult.map(a => [a.id, a.similarity]))

  // Search albums
  const albumsResult = await db
    .select({
      id: albums.id,
      title: albums.title,
      coverArt: albums.coverArt,
      popularity: albums.popularity,
      similarity: sql<number>`GREATEST(
        similarity(LOWER(${albums.title}), ${searchTerm}),
        COALESCE(similarity(LOWER(${albums.sortTitle}), ${searchTerm}), 0)
      )`,
    })
    .from(albums)
    .where(
      sql`GREATEST(
        similarity(LOWER(${albums.title}), ${searchTerm}),
        COALESCE(similarity(LOWER(${albums.sortTitle}), ${searchTerm}), 0)
      ) > ${AUTOCOMPLETE_THRESHOLD}`
    )
    .limit(perCategoryLimit * 2)

  // Get album artists for matched albums
  const albumsWithArtists = await Promise.all(
    albumsResult.map(async album => {
      const fullAlbum = await db.query.albums.findFirst({
        where: eq(albums.id, album.id),
        with: {
          albumArtists: { with: { artist: true }, limit: 1 },
        },
      })
      const hasMatchedArtist = fullAlbum?.albumArtists.some(aa => matchedArtistIds.has(aa.artistId))
      const artistBoost = hasMatchedArtist
        ? Math.max(
            ...(fullAlbum?.albumArtists.map(aa => artistScoreMap.get(aa.artistId) || 0) || [0])
          )
        : 0
      const primaryArtist = fullAlbum?.albumArtists?.[0]?.artist

      return {
        ...album,
        primaryArtist,
        artistBoost,
      }
    })
  )

  // Search tracks
  const tracksResult = await db
    .select({
      id: tracks.id,
      title: tracks.title,
      albumId: tracks.albumId,
      popularity: tracks.popularity,
      similarity: sql<number>`GREATEST(
        similarity(LOWER(${tracks.title}), ${searchTerm}),
        COALESCE(similarity(LOWER(${tracks.sortTitle}), ${searchTerm}), 0)
      )`,
    })
    .from(tracks)
    .where(
      sql`GREATEST(
        similarity(LOWER(${tracks.title}), ${searchTerm}),
        COALESCE(similarity(LOWER(${tracks.sortTitle}), ${searchTerm}), 0)
      ) > ${AUTOCOMPLETE_THRESHOLD}`
    )
    .limit(perCategoryLimit * 2)

  // Get track details
  const tracksWithDetails = await Promise.all(
    tracksResult.map(async track => {
      const fullTrack = await db.query.tracks.findFirst({
        where: eq(tracks.id, track.id),
        with: {
          album: true,
          trackArtists: { with: { artist: true }, limit: 1 },
        },
      })
      const hasMatchedArtist = fullTrack?.trackArtists.some(ta => matchedArtistIds.has(ta.artistId))
      const artistBoost = hasMatchedArtist
        ? Math.max(
            ...(fullTrack?.trackArtists.map(ta => artistScoreMap.get(ta.artistId) || 0) || [0])
          )
        : 0
      const primaryArtist = fullTrack?.trackArtists?.[0]?.artist

      return {
        ...track,
        album: fullTrack?.album,
        primaryArtist,
        artistBoost,
      }
    })
  )

  // Search playlists (public only)
  const playlistsResult = await db
    .select({
      id: playlists.id,
      name: playlists.name,
      description: playlists.description,
      coverImage: playlists.coverImage,
      popularity: playlists.popularity,
      similarity: sql<number>`GREATEST(
        similarity(LOWER(${playlists.name}), ${searchTerm}),
        COALESCE(similarity(LOWER(${playlists.description}), ${searchTerm}), 0)
      )`,
    })
    .from(playlists)
    .where(
      and(
        eq(playlists.visibility, PlaylistVisibilityEnum.Public),
        sql`GREATEST(
          similarity(LOWER(${playlists.name}), ${searchTerm}),
          COALESCE(similarity(LOWER(${playlists.description}), ${searchTerm}), 0)
        ) > ${AUTOCOMPLETE_THRESHOLD}`
      )
    )
    .limit(perCategoryLimit * 2)

  // Get playlist cover images from first track if needed
  const playlistsWithCovers = await Promise.all(
    playlistsResult.map(async playlist => {
      if (!playlist.coverImage) {
        const firstTrack = await db.query.playlists.findFirst({
          where: eq(playlists.id, playlist.id),
          with: {
            tracks: {
              limit: 1,
              with: {
                track: {
                  with: { album: true },
                },
              },
            },
          },
        })
        return {
          ...playlist,
          coverImage: firstTrack?.tracks?.[0]?.track?.album?.coverArt || null,
        }
      }
      return playlist
    })
  )

  // Calculate scores and format results
  const results: (AutocompleteResult & { score: number })[] = []

  // Format artists
  artistsResult.forEach(artist => {
    const popularityScore = Math.min((artist.popularity || 0) / 10000, 1)
    const score =
      artist.similarity * AUTOCOMPLETE_SIM_WEIGHT + popularityScore * AUTOCOMPLETE_POP_WEIGHT
    results.push({
      id: `artist-${artist.id}`,
      type: 'artist',
      title: artist.name,
      imageUrl: artist.image,
      relevanceScore: score,
      score,
    })
  })

  // Format albums
  albumsWithArtists.forEach(album => {
    const popularityScore = Math.min((album.popularity || 0) / 10000, 1)
    const baseScore =
      album.similarity * AUTOCOMPLETE_SIM_WEIGHT + popularityScore * AUTOCOMPLETE_POP_WEIGHT
    const score = baseScore + album.artistBoost * 0.15 // Small boost for artist match
    results.push({
      id: `album-${album.id}`,
      type: 'album',
      title: album.title,
      subtitle: album.primaryArtist?.name,
      imageUrl: album.coverArt,
      relevanceScore: score,
      score,
    })
  })

  // Format tracks
  tracksWithDetails.forEach(track => {
    const popularityScore = Math.min((track.popularity || 0) / 10000, 1)
    const baseScore =
      track.similarity * AUTOCOMPLETE_SIM_WEIGHT + popularityScore * AUTOCOMPLETE_POP_WEIGHT
    const score = baseScore + track.artistBoost * 0.15
    results.push({
      id: `track-${track.id}`,
      type: 'track',
      title: track.title,
      subtitle: track.primaryArtist?.name,
      imageUrl: track.album?.coverArt,
      relevanceScore: score,
      score,
    })
  })

  // Format playlists
  playlistsWithCovers.forEach(playlist => {
    const popularityScore = Math.min((playlist.popularity || 0) / 10000, 1)
    const score =
      playlist.similarity * AUTOCOMPLETE_SIM_WEIGHT + popularityScore * AUTOCOMPLETE_POP_WEIGHT
    results.push({
      id: `playlist-${playlist.id}`,
      type: 'playlist',
      title: playlist.name,
      subtitle: playlist.description || undefined,
      imageUrl: playlist.coverImage,
      relevanceScore: score,
      score,
    })
  })

  // Sort by score and limit
  const sortedResults = results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ score: _score, ...rest }) => rest) // Remove internal score field

  return {
    results: sortedResults,
  }
}
