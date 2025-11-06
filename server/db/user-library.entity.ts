import { index, integer, pgTable, serial, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod'
import z from 'zod'

import { mediaTypeEnum } from './stack.entity'

export const userLibrary = pgTable(
  'user_library',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull(),
    entityType: mediaTypeEnum('entity_type').notNull(),
    entityId: integer('entity_id').notNull(),
    addedAt: timestamp('added_at').defaultNow(),
  },
  table => [
    uniqueIndex('unique_user_library_item').on(table.userId, table.entityType, table.entityId),
    // Optional partial-like separation replicated via multiple indexes
    index('user_library_track_idx').on(table.userId, table.entityId),
  ]
)

export const UserLibrarySchema = createSelectSchema(userLibrary)
export const CreateUserLibrarySchema = createInsertSchema(userLibrary)
export const UpdateUserLibrarySchema = createUpdateSchema(userLibrary)

export type UserLibrary = z.infer<typeof UserLibrarySchema>
export type CreateUserLibrary = z.infer<typeof CreateUserLibrarySchema>
export type UpdateUserLibrary = z.infer<typeof UpdateUserLibrarySchema>
