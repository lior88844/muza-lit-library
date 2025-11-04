import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod'
import z from 'zod'

export enum StackSelectionTypeEnum {
  Manual = 'manual',
  Filter = 'filter',
  Hybrid = 'hybrid',
}

export enum StackEntityTypeEnum {
  Artist = 'artist',
  Album = 'album',
  Song = 'song',
  Playlist = 'playlist',
}

export const stackSelectionTypeEnum = pgEnum(
  'stack_selection_type',
  Object.values(StackSelectionTypeEnum) as [StackSelectionTypeEnum, ...StackSelectionTypeEnum[]]
)

export const stackEntityTypeEnum = pgEnum(
  'stack_entity_type',
  Object.values(StackEntityTypeEnum) as [StackEntityTypeEnum, ...StackEntityTypeEnum[]]
)

export const stacks = pgTable(
  'stacks',
  {
    id: serial('id').primaryKey(),
    pageIdentifier: varchar('page_identifier', { length: 255 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    entityType: stackEntityTypeEnum('entity_type').notNull(),
    displayOrder: integer('display_order').notNull(),
    selectionType: stackSelectionTypeEnum('selection_type').notNull(),
    filterConfig: jsonb('filter_config').$type<Record<string, unknown>>(),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('stacks_page_identifier_display_order_idx').on(table.pageIdentifier, table.displayOrder),
    index('stacks_page_identifier_idx').on(table.pageIdentifier),
  ]
)

export const StackSchema = createSelectSchema(stacks)
export const CreateStackSchema = createInsertSchema(stacks)
export const UpdateStackSchema = createUpdateSchema(stacks)

export type Stack = z.infer<typeof StackSchema>
export type CreateStack = z.infer<typeof CreateStackSchema>
export type UpdateStack = z.infer<typeof UpdateStackSchema>
