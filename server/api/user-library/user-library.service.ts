import { and, eq } from 'drizzle-orm'
import { EntityTypeEnum } from 'server/db/stack.entity'

import { db } from '../../db/connection'
import { type CreateUserLibrary, type UserLibrary, userLibrary } from '../../db/user-library.entity'
import type { AlbumResponse } from '../album/types/AlbumResponse'
import type { ArtistMiniResponse } from '../artist/types/ArtistResponse'
import type { PlaylistResponse } from '../playlist/types/MiniPlaylistResponse'
import { getEntitiesMap } from '../stack/stack.service'
import type { TrackResponse } from '../track/types/TrackResponse'

// Type mapping from EntityTypeEnum to specific entity types
type EntityTypeMap = {
  [EntityTypeEnum.Album]: AlbumResponse
  [EntityTypeEnum.Artist]: ArtistMiniResponse
  [EntityTypeEnum.Track]: TrackResponse
  [EntityTypeEnum.Playlist]: PlaylistResponse
}

export interface UserLibraryWithEntity<T extends EntityTypeEnum = EntityTypeEnum>
  extends UserLibrary {
  entity: EntityTypeMap[T]
}
/**
 * Add an item to user's library
 */
export async function addToLibrary(userId: number, entityType: EntityTypeEnum, entityId: number) {
  // Check if item already exists in user's library
  const existingItem = await db
    .select()
    .from(userLibrary)
    .where(
      and(
        eq(userLibrary.userId, userId),
        eq(userLibrary.entityType, entityType),
        eq(userLibrary.entityId, entityId)
      )
    )
    .limit(1)

  if (existingItem.length > 0) {
    throw new Error('Item already exists in user library')
  }

  // Create new library item
  const newLibraryItem: CreateUserLibrary = {
    userId,
    entityType,
    entityId,
  }

  const result = await db.insert(userLibrary).values(newLibraryItem).returning()

  return result[0] as UserLibrary
}

/**
 * Remove an item from user's library
 */
export async function removeFromLibrary(
  userId: number,
  entityType: EntityTypeEnum,
  entityId: number
): Promise<boolean> {
  const result = await db
    .delete(userLibrary)
    .where(
      and(
        eq(userLibrary.userId, userId),
        eq(userLibrary.entityType, entityType),
        eq(userLibrary.entityId, entityId)
      )
    )
    .returning()

  return result.length > 0
}

/**
 * Get user's library items
 */
export async function getUserLibrary<T extends EntityTypeEnum>(
  userId: number,
  entityType: T
): Promise<UserLibraryWithEntity<T>[]> {
  const items = await db.query.userLibrary.findMany({
    where: entityType
      ? and(eq(userLibrary.userId, userId), eq(userLibrary.entityType, entityType))
      : eq(userLibrary.userId, userId),
  })
  const entityIdsByType = {
    [entityType]: new Set(),
  }
  items.forEach(item => {
    entityIdsByType[item.entityType].add(item.entityId)
  })
  const entitiesMap = await getEntitiesMap(entityIdsByType)
  return items.map(item => ({
    ...item,
    entity: entitiesMap[item.entityType].get(item.entityId)!,
  })) as UserLibraryWithEntity<T>[]
}
export async function getAllUserLibrary(userId: number) {
  const items = await db.query.userLibrary.findMany({
    where: eq(userLibrary.userId, userId),
  })
  return items
}
/**
 * Check if item exists in user's library
 */
export async function isInLibrary(
  userId: number,
  entityType: EntityTypeEnum,
  entityId: number
): Promise<boolean> {
  const result = await db
    .select()
    .from(userLibrary)
    .where(
      and(
        eq(userLibrary.userId, userId),
        eq(userLibrary.entityType, entityType),
        eq(userLibrary.entityId, entityId)
      )
    )
    .limit(1)

  return result.length > 0
}
