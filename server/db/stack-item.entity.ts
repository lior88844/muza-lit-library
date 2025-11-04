import { index, integer, pgTable, serial, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod'
import z from 'zod'

import { stacks } from './stack.entity'
import { StackEntityTypeEnum, stackEntityTypeEnum } from './stack.entity'

export const stackItems = pgTable(
  'stack_items',
  {
    id: serial('id').primaryKey(),
    stackId: integer('stack_id')
      .notNull()
      .references(() => stacks.id, { onDelete: 'cascade' }),
    entityType: stackEntityTypeEnum('entity_type').notNull(),
    entityId: integer('entity_id').notNull(),
    displayOrder: integer('display_order').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    uniqueIndex('unique_stack_item').on(table.stackId, table.entityType, table.entityId),
    index('stack_items_stack_id_display_order_idx').on(table.stackId, table.displayOrder),
    index('stack_items_entity_type_entity_id_idx').on(table.entityType, table.entityId),
  ]
)

export const StackItemSchema = createSelectSchema(stackItems)
export const CreateStackItemSchema = createInsertSchema(stackItems)
export const UpdateStackItemSchema = createUpdateSchema(stackItems)

export type StackItem = z.infer<typeof StackItemSchema>
export type CreateStackItem = z.infer<typeof CreateStackItemSchema>
export type UpdateStackItem = z.infer<typeof UpdateStackItemSchema>

export { StackEntityTypeEnum }
