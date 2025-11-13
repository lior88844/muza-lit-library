import { index, integer, pgTable, serial, text, uniqueIndex } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod'
import z from 'zod'

import { albums } from './album.entity'
import { labels } from './label.entity'

// Junction table for album-label relationships
export const albumLabels = pgTable(
  'album_labels',
  {
    id: serial('id').primaryKey(),
    albumId: integer('album_id')
      .notNull()
      .references(() => albums.id, { onDelete: 'cascade' }),
    labelId: integer('label_id')
      .notNull()
      .references(() => labels.id, { onDelete: 'cascade' }),
    catalogNumber: text('catalog_number'),
    order: integer('order').notNull(),
  },
  table => [
    // Composite index for efficient album-label lookups
    index('album_label_idx').on(table.albumId, table.labelId),

    // Index for finding all albums by a label
    index('album_labels_label_idx').on(table.labelId),

    // Index for ordering labels within an album
    index('album_labels_album_order_idx').on(table.albumId, table.order),

    // Unique constraint to prevent duplicate album-label relationships
    uniqueIndex('unique_album_label').on(table.albumId, table.labelId),
  ]
)

export const AlbumLabelSchema = createSelectSchema(albumLabels)

export const CreateAlbumLabelSchema = createInsertSchema(albumLabels)

export const UpdateAlbumLabelSchema = createUpdateSchema(albumLabels)

// Type exports
export type AlbumLabel = z.infer<typeof AlbumLabelSchema>
export type CreateAlbumLabel = z.infer<typeof CreateAlbumLabelSchema>
export type UpdateAlbumLabel = z.infer<typeof UpdateAlbumLabelSchema>
