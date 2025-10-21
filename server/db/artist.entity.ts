import { boolean, integer, json, numeric, pgEnum, pgTable, serial, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod'
import z from 'zod'

export enum ArtistTypeEnum {
  Person = 'Person',
  Group = 'Group',
  Orchestra = 'Orchestra',
  Choir = 'Choir',
  Character = 'Character',
  Other = 'Other',
}
export enum GenderEnum {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other',
  NotApplicable = 'Not applicable',
}

// Enums
export const artistTypeEnum = pgEnum('artist_type', Object.values(ArtistTypeEnum) as [string, ...string[]])

export const genderEnum = pgEnum('gender', Object.values(GenderEnum) as [string, ...string[]])

// Artists table
export const artists = pgTable('artists', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  sortName: varchar('sort_name', { length: 255 }),
  disambiguation: varchar('disambiguation', { length: 255 }),
  type: artistTypeEnum('type'),
  gender: genderEnum('gender'),
  area: varchar('area', { length: 255 }),
  beginDate: timestamp('begin_date'),
  endDate: timestamp('end_date'),
  ended: boolean('ended').default(false),
  mbId: uuid('mb_id'),
  discogsId: numeric('discogs_id', { mode: 'number' }),
  bio: text('biography'),
  tags: text('tags').array(), // PostgreSQL array
  image: text('image'),
  links: json('links').$type<Record<string, string>>(), // JSON object
  isni: varchar('isni', { length: 50 }),
  ipis: text('ipis').array(), // PostgreSQL array
  popularity: integer('popularity').default(0),
  verified: boolean('verified').default(false),
  lastUpdated: timestamp('last_updated').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const ArtistSchema = createSelectSchema(artists)

export const CreateArtistSchema = createInsertSchema(artists)

export const UpdateArtistSchema = createUpdateSchema(artists)

// Type exports
export type Artist = z.infer<typeof ArtistSchema>
export type CreateArtist = z.infer<typeof CreateArtistSchema>
export type UpdateArtist = z.infer<typeof UpdateArtistSchema>
