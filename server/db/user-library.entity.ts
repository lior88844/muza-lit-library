import {
  pgTable,
  serial,
  integer,
  timestamp,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

export enum LibraryItemTypeEnum {
  Track = "Track",
  Album = "Album",
  Playlist = "Playlist",
  Artist = "Artist",
}

export const libraryItemTypeEnum = pgEnum(
  "library_item_type",
  Object.values(LibraryItemTypeEnum) as [string, ...string[]]
);

export const userLibrary = pgTable(
  "user_library",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    resourceType: libraryItemTypeEnum("resource_type").notNull(),
    resourceId: integer("resource_id").notNull(),
    addedAt: timestamp("added_at").defaultNow(),
  },
  table => [
    uniqueIndex("unique_user_library_item").on(
      table.userId,
      table.resourceType,
      table.resourceId
    ),
    // Optional partial-like separation replicated via multiple indexes
    index("user_library_track_idx").on(table.userId, table.resourceId),
  ]
);

export const UserLibrarySchema = createSelectSchema(userLibrary);
export const CreateUserLibrarySchema = createInsertSchema(userLibrary);
export const UpdateUserLibrarySchema = createUpdateSchema(userLibrary);

export type UserLibrary = z.infer<typeof UserLibrarySchema>;
export type CreateUserLibrary = z.infer<typeof CreateUserLibrarySchema>;
export type UpdateUserLibrary = z.infer<typeof UpdateUserLibrarySchema>;
