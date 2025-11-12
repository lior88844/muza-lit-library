import {
  boolean,
  integer,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'
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

export const albumTypeEnum = pgEnum(
  'album_type',
  Object.values(AlbumTypeEnum) as [string, ...string[]]
)
export const releaseStatusEnum = pgEnum(
  'release_status',
  Object.values(ReleaseStatusEnum) as [string, ...string[]]
)

// Albums table
export const albums = pgTable('albums', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  sortTitle: text('sort_title'),
  disambiguation: text('disambiguation'),
  releaseDate: timestamp('release_date'),
  albumType: albumTypeEnum('album_type').default('Album'),
  status: releaseStatusEnum('status').default('Official'),
  packaging: text('packaging'),
  country: text('country'),
  language: text('language'),
  script: text('script'),
  mbId: uuid('mb_id'),
  discogsId: numeric('discogs_id', { mode: 'number' }),
  discNumber: integer('disc_number'),
  mbReleaseGroupId: uuid('mb_release_group_id'),
  barcode: text('barcode'),
  catalogNumber: text('catalog_number'),
  coverArt: text('cover_art'),
  trackCount: integer('track_count').default(0),
  genres: text('genres').array(),
  tags: text('tags').array(),
  notes: text('notes'),
  quality: integer('quality').default(0),
  popularity: integer('popularity').default(0),
  verified: boolean('verified').default(false),
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
