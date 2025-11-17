import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod'
import z from 'zod'

export enum StackSelectionTypeEnum {
  Manual = 'manual',
  Filter = 'filter',
  Hybrid = 'hybrid',
}
export enum StackPageIdEnum {
  Home = 'home',
  Explore = 'explore',
  Artist = 'artist',
}
export enum EntityTypeEnum {
  Artist = 'artist',
  Album = 'album',
  Track = 'track',
  Playlist = 'playlist',
}

export const stackSelectionTypeEnum = pgEnum(
  'stack_selection_type',
  Object.values(StackSelectionTypeEnum) as [StackSelectionTypeEnum, ...StackSelectionTypeEnum[]]
)

export const mediaTypeEnum = pgEnum(
  'stack_entity_type',
  Object.values(EntityTypeEnum) as [EntityTypeEnum, ...EntityTypeEnum[]]
)

export const stackPageIdEnum = pgEnum(
  'stack_page_id',
  Object.values(StackPageIdEnum) as [StackPageIdEnum, ...StackPageIdEnum[]]
)

export const stacks = pgTable(
  'stacks',
  {
    id: serial('id').primaryKey(),
    pageId: stackPageIdEnum('page_id').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    entityType: mediaTypeEnum('entity_type').notNull(),
    displayOrder: integer('display_order').notNull(),
    selectionType: stackSelectionTypeEnum('selection_type').notNull(),
    filterConfig: jsonb('filter_config').$type<Record<string, unknown>>(),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('stacks_page_identifier_display_order_idx').on(table.pageId, table.displayOrder),
    index('stacks_page_identifier_idx').on(table.pageId),
  ]
)

export const StackSchema = createSelectSchema(stacks)
export const CreateStackSchema = createInsertSchema(stacks)
export const UpdateStackSchema = createUpdateSchema(stacks)

export type Stack = z.infer<typeof StackSchema>
export type CreateStack = z.infer<typeof CreateStackSchema>
export type UpdateStack = z.infer<typeof UpdateStackSchema>
