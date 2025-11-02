import { integer, pgEnum, pgTable, serial, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod'
import z from 'zod'

import { playlists } from './playlist.entity'

export enum PlaylistSharePermissionEnum {
  View = 'View',
}

export const playlistSharePermissionEnum = pgEnum(
  'playlist_share_permission',
  Object.values(PlaylistSharePermissionEnum) as [string, ...string[]]
)

export const playlistShares = pgTable(
  'playlist_shares',
  {
    id: serial('id').primaryKey(),
    playlistId: integer('playlist_id')
      .notNull()
      .references(() => playlists.id, { onDelete: 'cascade' }),
    granteeUserId: integer('grantee_user_id').notNull(),
    permission: playlistSharePermissionEnum('permission').default('View'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  table => [uniqueIndex('unique_playlist_share').on(table.playlistId, table.granteeUserId)]
)

export const PlaylistShareSchema = createSelectSchema(playlistShares)
export const CreatePlaylistShareSchema = createInsertSchema(playlistShares)
export const UpdatePlaylistShareSchema = createUpdateSchema(playlistShares)

export type PlaylistShare = z.infer<typeof PlaylistShareSchema>
export type CreatePlaylistShare = z.infer<typeof CreatePlaylistShareSchema>
export type UpdatePlaylistShare = z.infer<typeof UpdatePlaylistShareSchema>
