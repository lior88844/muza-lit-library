import { integer, pgEnum, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod'
import z from 'zod'

export enum PlaylistVisibilityEnum {
  Public = 'public',
  Private = 'private',
}

export const playlistVisibilityEnum = pgEnum(
  'playlist_visibility',
  Object.values(PlaylistVisibilityEnum) as [PlaylistVisibilityEnum, ...PlaylistVisibilityEnum[]]
)

export const playlists = pgTable('playlists', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  visibility: playlistVisibilityEnum('visibility').default(PlaylistVisibilityEnum.Private),
  coverImage: text('cover_image'),
  duration: integer('duration').default(0), // cached seconds
  trackCount: integer('track_count').default(0),
  popularity: integer('popularity').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const PlaylistSchema = createSelectSchema(playlists)
export const CreatePlaylistSchema = createInsertSchema(playlists)
export const UpdatePlaylistSchema = createUpdateSchema(playlists)

export type Playlist = z.infer<typeof PlaylistSchema>
export type CreatePlaylist = z.infer<typeof CreatePlaylistSchema>
export type UpdatePlaylist = z.infer<typeof UpdatePlaylistSchema>
