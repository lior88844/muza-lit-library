import { index, integer, pgTable, serial, text, uniqueIndex } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod'
import z from 'zod'

import { artists } from './artist.entity'
import { tracks } from './track.entity'

// Junction table for track-artist relationships
export const trackArtists = pgTable(
  'track_artists',
  {
    id: serial('id').primaryKey(),
    trackId: integer('track_id')
      .notNull()
      .references(() => tracks.id, { onDelete: 'cascade' }),
    artistId: integer('artist_id')
      .notNull()
      .references(() => artists.id, { onDelete: 'cascade' }),
    role: text('role'),
    order: integer('order').notNull(), // For ordering artists (main artist first, etc.)
  },
  table => [
    // Composite index for efficient track-artist lookups
    index('track_artist_idx').on(table.trackId, table.artistId),

    // Index for finding all tracks by an artist
    index('track_artists_artist_idx').on(table.artistId),

    // Index for finding tracks by artist and role
    index('track_artists_artist_role_idx').on(table.artistId, table.role),

    // Index for ordering artists within a track
    index('track_artists_track_order_idx').on(table.trackId, table.order),

    // Unique constraint to prevent duplicate track-artist relationships
    uniqueIndex('unique_track_artist').on(table.trackId, table.artistId, table.role),
  ]
)

export const TrackArtistSchema = createSelectSchema(trackArtists)

export const CreateTrackArtistSchema = createInsertSchema(trackArtists)

export const UpdateTrackArtistSchema = createUpdateSchema(trackArtists)

// Type exports
export type TrackArtist = z.infer<typeof TrackArtistSchema>
export type CreateTrackArtist = z.infer<typeof CreateTrackArtistSchema>
export type UpdateTrackArtist = z.infer<typeof UpdateTrackArtistSchema>
