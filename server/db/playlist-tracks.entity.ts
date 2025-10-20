import {
  pgTable,
  serial,
  integer,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { playlists } from "./playlist.entity";
import { tracks } from "./track.entity";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

export const playlistTracks = pgTable(
  "playlist_tracks",
  {
    id: serial("id").primaryKey(),
    playlistId: integer("playlist_id")
      .notNull()
      .references(() => playlists.id, { onDelete: "cascade" }),
    trackId: integer("track_id")
      .notNull()
      .references(() => tracks.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    addedByUserId: integer("added_by_user_id").notNull(),
    addedAt: timestamp("added_at").defaultNow(),
  },
  table => [
    uniqueIndex("unique_playlist_track").on(table.playlistId, table.trackId),
    uniqueIndex("unique_playlist_position").on(
      table.playlistId,
      table.position
    ),
    index("playlist_tracks_track_idx").on(table.trackId),
  ]
);

export const PlaylistTrackSchema = createSelectSchema(playlistTracks);
export const CreatePlaylistTrackSchema = createInsertSchema(playlistTracks);
export const UpdatePlaylistTrackSchema = createUpdateSchema(playlistTracks);

export type PlaylistTrack = z.infer<typeof PlaylistTrackSchema>;
export type CreatePlaylistTrack = z.infer<typeof CreatePlaylistTrackSchema>;
export type UpdatePlaylistTrack = z.infer<typeof UpdatePlaylistTrackSchema>;
