import { and, eq } from 'drizzle-orm'

import { db } from '../../db/connection'
import { userLibrary } from '../../db/user-library.entity'
import { type CreateUserLibrary, MediaTypeEnum, type UserLibrary } from '../../db/user-library.entity'

/**
 * Add an item to user's library
 */
export async function addToLibrary(userId: number, resourceType: MediaTypeEnum, resourceId: number) {
  // Check if item already exists in user's library
  const existingItem = await db
    .select()
    .from(userLibrary)
    .where(and(eq(userLibrary.userId, userId), eq(userLibrary.resourceType, resourceType), eq(userLibrary.resourceId, resourceId)))
    .limit(1)

  if (existingItem.length > 0) {
    throw new Error('Item already exists in user library')
  }

  // Create new library item
  const newLibraryItem: CreateUserLibrary = {
    userId,
    resourceType,
    resourceId,
  }

  const result = await db.insert(userLibrary).values(newLibraryItem).returning()

  return result[0] as UserLibrary
}

/**
 * Remove an item from user's library
 */
export async function removeFromLibrary(userId: number, resourceType: MediaTypeEnum, resourceId: number): Promise<boolean> {
  const result = await db
    .delete(userLibrary)
    .where(and(eq(userLibrary.userId, userId), eq(userLibrary.resourceType, resourceType), eq(userLibrary.resourceId, resourceId)))
    .returning()

  return result.length > 0
}

/**
 * Get user's library items
 */
export async function getUserLibrary(userId: number, resourceType?: MediaTypeEnum): Promise<UserLibrary[]> {
  if (resourceType) {
    return await db
      .select()
      .from(userLibrary)
      .where(and(eq(userLibrary.userId, userId), eq(userLibrary.resourceType, resourceType)))
  }

  return await db.select().from(userLibrary).where(eq(userLibrary.userId, userId))
}

/**
 * Check if item exists in user's library
 */
export async function isInLibrary(userId: number, resourceType: MediaTypeEnum, resourceId: number): Promise<boolean> {
  const result = await db
    .select()
    .from(userLibrary)
    .where(and(eq(userLibrary.userId, userId), eq(userLibrary.resourceType, resourceType), eq(userLibrary.resourceId, resourceId)))
    .limit(1)

  return result.length > 0
}
