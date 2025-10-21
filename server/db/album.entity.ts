import { boolean, integer, numeric, pgEnum, pgTable, serial, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod'
import z from 'zod'

export enum AlbumTypeEnum {
  Album = 'Album',
  Single = 'Single',
  EP = 'EP',
  Compilation = 'Compilation',
  Soundtrack = 'Soundtrack',
  Live = 'Live',
  Remix = 'Remix',
  Other = 'Other',
}

export enum ReleaseStatusEnum {
  Official = 'Official',
  Promotion = 'Promotion',
  Bootleg = 'Bootleg',
  PseudoRelease = 'Pseudo-Release',
}

export const albumTypeEnum = pgEnum('album_type', Object.values(AlbumTypeEnum) as [string, ...string[]])
export const releaseStatusEnum = pgEnum('release_status', Object.values(ReleaseStatusEnum) as [string, ...string[]])

// Albums table
export const albums = pgTable('albums', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  sortTitle: varchar('sort_title', { length: 255 }),
  disambiguation: varchar('disambiguation', { length: 255 }),
  releaseDate: timestamp('release_date'),
  albumType: albumTypeEnum('album_type').default('Album'),
  status: releaseStatusEnum('status').default('Official'),
  packaging: varchar('packaging', { length: 100 }),
  country: varchar('country', { length: 2 }),
  language: varchar('language', { length: 3 }),
  script: varchar('script', { length: 4 }),
  mbId: uuid('mb_id'),
  discogsId: numeric('discogs_id', { mode: 'number' }),
  mbReleaseGroupId: uuid('mb_release_group_id'),
  barcode: varchar('barcode', { length: 50 }),
  catalogNumber: varchar('catalog_number', { length: 100 }),
  label: varchar('label', { length: 255 }),
  coverArt: text('cover_art'),
  trackCount: integer('track_count').default(0),
  genres: text('genres').array(),
  tags: text('tags').array(),
  notes: text('notes'),
  quality: integer('quality').default(0),
  popularity: integer('popularity').default(0),
  verified: boolean('verified').default(false),
  lastUpdated: timestamp('last_updated').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const AlbumSchema = createSelectSchema(albums)

export const CreateAlbumSchema = createInsertSchema(albums)

export const UpdateAlbumSchema = createUpdateSchema(albums)

// Type exports
export type Album = z.infer<typeof AlbumSchema>
export type CreateAlbum = z.infer<typeof CreateAlbumSchema>
export type UpdateAlbum = z.infer<typeof UpdateAlbumSchema>
