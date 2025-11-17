import { and, asc, eq, inArray } from 'drizzle-orm'

import { albums } from '../../db/album.entity'
import { artists } from '../../db/artist.entity'
import { db } from '../../db/connection'
import { playlists } from '../../db/playlist.entity'
import type { CreateStack, Stack, StackPageIdEnum, UpdateStack } from '../../db/stack.entity'
import { EntityTypeEnum, stacks } from '../../db/stack.entity'
import type { CreateStackItem } from '../../db/stack-item.entity'
import { stackItems } from '../../db/stack-item.entity'
import { tracks } from '../../db/track.entity'
import { formatAlbum } from '../album/album.service'
import type { AlbumResponse } from '../album/types/AlbumResponse'
import { formatArtist } from '../artist/artist.service'
import type { ArtistMiniResponse, ArtistWithAlbums } from '../artist/types/ArtistResponse'
import { formatMiniPlaylist, type PlaylistWithTracks } from '../playlist/playlist.service'
import type { PlaylistResponse } from '../playlist/types/MiniPlaylistResponse'
import { formatTrack } from '../track/track.service'
import type { TrackResponse } from '../track/types/TrackResponse'
import type { TrackWithArtists } from '../track/types/TrackWithArtists'
import type { StackItemUpdateData, StackWithEntities, StackWithItems } from './types'

/**
 * Get stacks by page identifier
 */
export async function getStacksByPage(pageId: StackPageIdEnum): Promise<StackWithEntities[]> {
  const stacksData = await db.query.stacks.findMany({
    where: and(eq(stacks.pageId, pageId), eq(stacks.isActive, true)),
    orderBy: asc(stacks.displayOrder),
    with: {
      items: true,
    },
  })
  return getStacksWithEntities(stacksData as StackWithItems[])
}

/**
 * Get a single stack by ID
 */
export async function getStackById(stackId: number): Promise<Stack | null> {
  const result = await db.select().from(stacks).where(eq(stacks.id, stackId)).limit(1)

  return result[0] as Stack | null
}

/**
 * Get stack with items by ID
 */
export async function getStackWithEntitiesById(stackId: number): Promise<StackWithEntities | null> {
  const stack = await db.query.stacks.findFirst({
    where: eq(stacks.id, stackId),
    orderBy: asc(stacks.displayOrder),
    with: {
      items: true,
    },
  })
  if (!stack) {
    return null
  }
  const stackWithEntities = await getStacksWithEntities([stack])

  return stackWithEntities[0]
}

/**
 * Create a new stack
 */
export async function createStack(
  data: Omit<CreateStack, 'id' | 'createdAt' | 'updatedAt'>,
  items?: StackItemUpdateData[]
): Promise<StackWithEntities> {
  const newStack: CreateStack = {
    ...data,
  }

  const [result] = await db.insert(stacks).values(newStack).returning()

  // Handle stack items if provided
  if (items && items.length > 0 && result.id) {
    const newStackItems: CreateStackItem[] = items.map(item => ({
      stackId: result.id,
      entityType: item.entityType,
      entityId: item.entityId,
      displayOrder: item.displayOrder,
    }))

    await db.insert(stackItems).values(newStackItems)
  }

  // Return stack with items
  const stackWithItems = await getStackWithEntitiesById(result.id)
  if (!stackWithItems) {
    throw new Error('Failed to retrieve created stack')
  }

  return stackWithItems
}

/**
 * Update a stack
 */
export async function updateStack(stackId: number, data: Partial<UpdateStack>): Promise<Stack> {
  const result = await db
    .update(stacks)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(stacks.id, stackId))
    .returning()

  if (!result[0]) {
    throw new Error('Stack not found')
  }

  return result[0] as Stack
}

/**
 * Sync stack items - replaces all items with the provided list
 */
export async function syncStackItems(stackId: number, items: StackItemUpdateData[]): Promise<void> {
  // Delete existing items
  await db.delete(stackItems).where(eq(stackItems.stackId, stackId))

  // Insert new items
  if (items.length > 0) {
    const newStackItems: CreateStackItem[] = items.map(item => ({
      stackId: stackId,
      entityType: item.entityType,
      entityId: item.entityId,
      displayOrder: item.displayOrder,
    }))

    await db.insert(stackItems).values(newStackItems)
  }
}

/**
 * Update stack and sync items in one transaction
 */
export async function updateStackWithItems(
  stackId: number,
  data: Partial<UpdateStack>,
  items: StackItemUpdateData[]
): Promise<StackWithEntities> {
  // Update stack
  await updateStack(stackId, data)

  // Sync items if provided
  if (items !== undefined) {
    await syncStackItems(stackId, items)
  }

  // Return updated stack with items
  const stackWithItems = await getStackWithEntitiesById(stackId)
  if (!stackWithItems) {
    throw new Error('Failed to retrieve updated stack')
  }

  return stackWithItems
}

/**
 * Delete a stack
 */
export async function deleteStack(stackId: number): Promise<boolean> {
  // Stack items are deleted via CASCADE, so we only need to delete the stack
  try {
    await Promise.all([
      db.delete(stacks).where(eq(stacks.id, stackId)),
      db.delete(stackItems).where(eq(stackItems.stackId, stackId)),
    ])
    return true
  } catch (error) {
    console.error('Error deleting stack:', error)
    return false
  }
}
const getStacksWithEntities = async (stacks: StackWithItems[]): Promise<StackWithEntities[]> => {
  // Collect unique entity IDs grouped by entity type
  const entityIdsByType: Record<EntityTypeEnum, Set<number>> = {
    [EntityTypeEnum.Album]: new Set(),
    [EntityTypeEnum.Artist]: new Set(),
    [EntityTypeEnum.Track]: new Set(),
    [EntityTypeEnum.Playlist]: new Set(),
  }

  stacks.forEach(stack => {
    stack.items.forEach(item => {
      entityIdsByType[item.entityType].add(item.entityId)
    })
  })
  const entitiesMap = await getEntitiesMap(entityIdsByType)
  // Enrich stack items with entity data
  return stacks.map(stack => ({
    ...stack,
    items: stack.items.map(item => {
      let entity: AlbumResponse | ArtistMiniResponse | TrackResponse | PlaylistResponse

      switch (item.entityType) {
        case EntityTypeEnum.Album:
          entity = entitiesMap[EntityTypeEnum.Album].get(item.entityId)!
          break
        case EntityTypeEnum.Artist:
          entity = entitiesMap[EntityTypeEnum.Artist].get(item.entityId)!
          break
        case EntityTypeEnum.Track:
          entity = entitiesMap[EntityTypeEnum.Track].get(item.entityId)!
          break
        case EntityTypeEnum.Playlist:
          entity = entitiesMap[EntityTypeEnum.Playlist].get(item.entityId)!
          break
      }

      return {
        ...item,
        entity,
      }
    }),
  }))
}

export const getEntitiesMap = async (
  entityIdsByType: Partial<Record<EntityTypeEnum, Set<number>>>
) => {
  const [albumsData, artistsData, tracksData, playlistsData] = await Promise.all([
    entityIdsByType[EntityTypeEnum.Album] && entityIdsByType[EntityTypeEnum.Album].size > 0
      ? db.query.albums.findMany({
          where: inArray(albums.id, Array.from(entityIdsByType[EntityTypeEnum.Album])),
          with: {
            albumArtists: { with: { artist: true } },
            tracks: { with: { trackArtists: { with: { artist: true } } } },
          },
        })
      : Promise.resolve([]),
    entityIdsByType[EntityTypeEnum.Artist] && entityIdsByType[EntityTypeEnum.Artist].size > 0
      ? db.query.artists.findMany({
          where: inArray(artists.id, Array.from(entityIdsByType[EntityTypeEnum.Artist])),
          with: {
            albumArtists: true,
          },
        })
      : Promise.resolve([]),
    entityIdsByType[EntityTypeEnum.Track] && entityIdsByType[EntityTypeEnum.Track].size > 0
      ? db.query.tracks.findMany({
          where: inArray(tracks.id, Array.from(entityIdsByType[EntityTypeEnum.Track])),
          with: {
            album: true,
            trackArtists: { with: { artist: true } },
          },
        })
      : Promise.resolve([]),
    entityIdsByType[EntityTypeEnum.Playlist] && entityIdsByType[EntityTypeEnum.Playlist].size > 0
      ? db.query.playlists.findMany({
          where: inArray(playlists.id, Array.from(entityIdsByType[EntityTypeEnum.Playlist])),
          with: {
            tracks: {
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
      : Promise.resolve([]),
  ])

  // Format entities to mini responses
  const formattedAlbums = albumsData.map(formatAlbum)
  const formattedArtists = formatArtist(artistsData as ArtistWithAlbums[])
  const formattedTracks = (tracksData as TrackWithArtists[]).map(formatTrack)
  const formattedPlaylists = (playlistsData as PlaylistWithTracks[]).map(formatMiniPlaylist)

  return {
    [EntityTypeEnum.Album]: new Map(formattedAlbums.map(album => [album.id, album])),
    [EntityTypeEnum.Artist]: new Map(formattedArtists.map(artist => [artist.id, artist])),
    [EntityTypeEnum.Track]: new Map(formattedTracks.map(track => [track.id, track])),
    [EntityTypeEnum.Playlist]: new Map(formattedPlaylists.map(playlist => [playlist.id, playlist])),
  }
}
