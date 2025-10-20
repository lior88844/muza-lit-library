import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

export enum PlaylistVisibilityEnum {
  Public = "Public",
  Private = "Private",
}

export const playlistVisibilityEnum = pgEnum(
  "playlist_visibility",
  Object.values(PlaylistVisibilityEnum) as [string, ...string[]]
);

export const playlists = pgTable("playlists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Intentionally no FK here (user table managed elsewhere)
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  visibility: playlistVisibilityEnum("visibility").default("Private"),
  coverImage: text("cover_image"),
  duration: integer("duration").default(0), // cached seconds
  trackCount: integer("track_count").default(0),
  popularity: integer("popularity").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const PlaylistSchema = createSelectSchema(playlists);
export const CreatePlaylistSchema = createInsertSchema(playlists);
export const UpdatePlaylistSchema = createUpdateSchema(playlists);

export type Playlist = z.infer<typeof PlaylistSchema>;
export type CreatePlaylist = z.infer<typeof CreatePlaylistSchema>;
export type UpdatePlaylist = z.infer<typeof UpdatePlaylistSchema>;
