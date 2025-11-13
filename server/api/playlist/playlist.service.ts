import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm'

import { db } from '../../db/connection'
import type {
  CreatePlaylist,
  Playlist,
  PlaylistVisibilityEnum,
  UpdatePlaylist,
} from '../../db/playlist.entity'
import { playlists } from '../../db/playlist.entity'
import type { PlaylistTrack } from '../../db/playlist-tracks.entity'
import { playlistTracks } from '../../db/playlist-tracks.entity'
import { tracks } from '../../db/track.entity'
import { formatTrack } from '../track/track.service'
import type { TrackWithArtists } from '../track/types/TrackWithArtists'
import type { PlaylistResponse } from './types/MiniPlaylistResponse'

export interface PlaylistWithTracks extends Playlist {
  tracks: (PlaylistTrack & { track: TrackWithArtists })[]
}

export interface TrackUpdateData {
  id: number
  position: number
}
/**
 * Create a new playlist
 */
export async function createPlaylist(
  userId: number,
  data: Omit<CreatePlaylist, 'userId'>
): Promise<Playlist> {
  const newPlaylist: CreatePlaylist = {
    ...data,
    userId,
  }

  const result = await db.insert(playlists).values(newPlaylist).returning()
  return result[0] as Playlist
}

/**
 * Get playlists for a user
 */
export async function getUserPlaylists(userId: number): Promise<PlaylistResponse[]> {
  // return (await db.select().from(playlists).where(eq(playlists.userId, userId)).orderBy(desc(playlists.createdAt))).map(formatPlaylist)
  const res = await db.query.playlists.findMany({
    where: eq(playlists.userId, userId),
    orderBy: desc(playlists.createdAt),
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
  return res.map(formatMiniPlaylist)
}

/**
 * Get a single playlist by ID
 */
export async function getPlaylistById(
  playlistId: number,
  userId?: number
): Promise<Playlist | null> {
  const conditions = userId
    ? and(eq(playlists.id, playlistId), eq(playlists.userId, userId))
    : eq(playlists.id, playlistId)

  const result = await db.select().from(playlists).where(conditions).limit(1)

  return result[0] as Playlist
}

/**
 * Update a playlist
 */
export async function updatePlaylist(
  playlistId: number,
  userId: number,
  data: Partial<UpdatePlaylist>
): Promise<Playlist> {
  const result = await db
    .update(playlists)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(playlists.id, playlistId), eq(playlists.userId, userId)))
    .returning()

  if (!result[0]) {
    throw new Error('Playlist not found or unauthorized')
  }

  return result[0] as Playlist
}

/**
 * Delete a playlist
 */
export async function deletePlaylist(playlistId: number, userId: number): Promise<boolean> {
  const result = await db
    .delete(playlists)
    .where(and(eq(playlists.id, playlistId), eq(playlists.userId, userId)))
    .returning()

  return result.length > 0
}

/**
 * Get tracks for a playlist
 */
export async function getPlaylistTracks(playlistId: number) {
  const result = await db
    .select({
      track: tracks,
      position: playlistTracks.position,
      addedAt: playlistTracks.addedAt,
    })
    .from(playlistTracks)
    .innerJoin(tracks, eq(playlistTracks.trackId, tracks.id))
    .where(eq(playlistTracks.playlistId, playlistId))
    .orderBy(playlistTracks.position)

  return result
}

/**
 * Update playlist metadata (track count, duration)
 */
async function updatePlaylistMetadata(playlistId: number): Promise<void> {
  const tracksData = await db
    .select({
      count: sql<number>`COUNT(*)::int`,
      totalDuration: sql<number>`COALESCE(SUM(${tracks.duration}), 0)::int`,
    })
    .from(playlistTracks)
    .innerJoin(tracks, eq(playlistTracks.trackId, tracks.id))
    .where(eq(playlistTracks.playlistId, playlistId))

  const { count, totalDuration } = tracksData[0] || { count: 0, totalDuration: 0 }

  // Note: Cover image will be set to null for now - can be set manually or from first track's album
  await db
    .update(playlists)
    .set({
      trackCount: count,
      duration: totalDuration,
      updatedAt: new Date(),
    })
    .where(eq(playlists.id, playlistId))
}

/**
 * Get playlist with tracks
 */
export async function getPlaylistWithTracks(playlistId: number, userId?: number) {
  const playlist = await getPlaylistById(playlistId, userId)
  if (!playlist) {
    return null
  }

  const playlistTracksData = await getPlaylistTracks(playlistId)

  return {
    ...playlist,
    tracks: playlistTracksData,
  }
}

/**
 * Sync playlist tracks - replaces all tracks with the provided list
 * Handles add, remove, and reorder in one operation
 */
export async function syncPlaylistTracks(
  playlistId: number,
  trackUpdates: TrackUpdateData[],
  userId: number
): Promise<void> {
  // Get current tracks
  const currentTracks = await db
    .select()
    .from(playlistTracks)
    .where(eq(playlistTracks.playlistId, playlistId))

  const currentTrackIds = new Set(currentTracks.map(t => t.trackId))
  const newTrackIds = new Set(trackUpdates.map(t => t.id))

  // Create a map of trackId -> newPosition for efficient lookup
  const trackPositionMap = new Map(trackUpdates.map(t => [t.id, t.position]))

  // Find tracks to delete (in current but not in new)
  const tracksToDelete = currentTracks.filter(t => !newTrackIds.has(t.trackId))

  // Find tracks to add (in new but not in current)
  const tracksToAdd = trackUpdates.filter(t => !currentTrackIds.has(t.id))

  // Find tracks to update (in both current and new)
  const tracksToUpdate = currentTracks.filter(t => newTrackIds.has(t.trackId))

  // Delete removed tracks
  if (tracksToDelete.length > 0) {
    await db.delete(playlistTracks).where(
      and(
        eq(playlistTracks.playlistId, playlistId),
        inArray(
          playlistTracks.trackId,
          tracksToDelete.map(t => t.trackId)
        )
      )
    )
  }

  // Update positions for existing tracks BEFORE inserting new ones
  // Shift existing tracks down by the number of new tracks being added
  if (tracksToUpdate.length > 0 && tracksToAdd.length > 0) {
    // Shift all existing tracks down by the number of new tracks
    // This makes room for the new tracks at the beginning
    // Update in DESCENDING order to avoid position conflicts
    const sortedTracks = [...tracksToUpdate].sort((a, b) => b.position - a.position)

    for (const track of sortedTracks) {
      await db
        .update(playlistTracks)
        .set({ position: track.position + tracksToAdd.length })
        .where(
          and(eq(playlistTracks.playlistId, playlistId), eq(playlistTracks.trackId, track.trackId))
        )
    }
  } else if (tracksToUpdate.length > 0) {
    // No new tracks being added, just update positions (reordering)
    await Promise.all(
      tracksToUpdate.map(track => {
        const newPosition = trackPositionMap.get(track.trackId)
        if (newPosition === undefined) return Promise.resolve()

        return db
          .update(playlistTracks)
          .set({ position: newPosition })
          .where(
            and(
              eq(playlistTracks.playlistId, playlistId),
              eq(playlistTracks.trackId, track.trackId)
            )
          )
      })
    )
  }

  // Add new tracks AFTER updating existing positions
  if (tracksToAdd.length > 0) {
    const newPlaylistTracks = tracksToAdd.map(track => ({
      playlistId,
      trackId: track.id,
      position: track.position,
      addedByUserId: userId,
    }))

    await db.insert(playlistTracks).values(newPlaylistTracks)
  }

  // Update playlist metadata
  await updatePlaylistMetadata(playlistId)
}
export const formatMiniPlaylist = (playlist: PlaylistWithTracks): PlaylistResponse => {
  return {
    id: playlist.id,
    title: playlist.name,
    // @TODO: Get the actual author of the playlist
    author: 'Admin',
    imageSrc: playlist.coverImage || undefined,
    description: playlist.description || undefined,
    createdAt: playlist.createdAt!,
    trackCount: playlist.trackCount || 0,
    visibility: playlist.visibility as PlaylistVisibilityEnum,
    songs: playlist.tracks.map(track => formatTrack(track.track)),
  }
}
