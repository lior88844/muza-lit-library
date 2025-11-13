import { boolean, index, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod'
import z from 'zod'

import { tracks } from './track.entity'

export const playHistory = pgTable(
  'play_history',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id'), // Cognito sub UUID, nullable for anonymous plays
    trackId: integer('track_id')
      .notNull()
      .references(() => tracks.id, { onDelete: 'cascade' }),
    playedAt: timestamp('played_at').defaultNow().notNull(),
    duration: integer('duration'), // seconds played, nullable
    completed: boolean('completed').default(false),
  },
  table => [
    // Index for user play history queries (most common)
    index('play_history_user_played_at_idx').on(table.userId, table.playedAt),
    // Index for track play history queries
    index('play_history_track_idx').on(table.trackId),
    // Index for user-track queries
    index('play_history_user_track_idx').on(table.userId, table.trackId),
  ]
)

export const PlayHistorySchema = createSelectSchema(playHistory)
export const CreatePlayHistorySchema = createInsertSchema(playHistory)
export const UpdatePlayHistorySchema = createUpdateSchema(playHistory)

// Type exports
export type PlayHistory = z.infer<typeof PlayHistorySchema>
export type CreatePlayHistory = z.infer<typeof CreatePlayHistorySchema>
export type UpdatePlayHistory = z.infer<typeof UpdatePlayHistorySchema>
