import { boolean, numeric, pgTable, serial, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod'
import z from 'zod'

// Labels table
export const labels = pgTable('labels', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  sortName: text('sort_name'),
  disambiguation: text('disambiguation'),
  labelCode: text('label_code'),
  country: text('country'),
  area: text('area'),
  beginDate: timestamp('begin_date'),
  endDate: timestamp('end_date'),
  mbId: uuid('mb_id'),
  discogsId: numeric('discogs_id', { mode: 'number' }),
  ipis: text('ipis').array(),
  verified: boolean('verified').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const LabelSchema = createSelectSchema(labels)

export const CreateLabelSchema = createInsertSchema(labels)

export const UpdateLabelSchema = createUpdateSchema(labels)

// Type exports
export type Label = z.infer<typeof LabelSchema>
export type CreateLabel = z.infer<typeof CreateLabelSchema>
export type UpdateLabel = z.infer<typeof UpdateLabelSchema>
