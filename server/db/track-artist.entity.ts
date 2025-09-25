import {
  pgTable,
  serial,
  integer,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { artists } from "./artist.entity";
import { tracks } from "./track.entity";

export enum ArtistRoleEnum {
  MainArtist = "MainArtist",
  FeaturedArtist = "FeaturedArtist",
  Producer = "Producer",
  Composer = "Composer",
  Lyricist = "Lyricist",
  Remixer = "Remixer",
  Arranger = "Arranger",
  Performer = "Performer",
  GuestArtist = "GuestArtist",
  Other = "Other",
}

// Enum for artist roles in tracks
export const artistRoleEnum = pgEnum(
  "artist_role",
  Object.values(ArtistRoleEnum) as [string, ...string[]]
);

// Junction table for track-artist relationships
export const trackArtists = pgTable(
  "track_artists",
  {
    id: serial("id").primaryKey(),
    trackId: integer("track_id")
      .notNull()
      .references(() => tracks.id, { onDelete: "cascade" }),
    artistId: integer("artist_id")
      .notNull()
      .references(() => artists.id, { onDelete: "cascade" }),
    role: artistRoleEnum("role").notNull().default(ArtistRoleEnum.MainArtist),
    order: integer("order").default(0), // For ordering artists (main artist first, etc.)
  },
  table => [
    // Composite index for efficient track-artist lookups
    index("track_artist_idx").on(table.trackId, table.artistId),

    // Index for finding all tracks by an artist
    index("track_artists_artist_idx").on(table.artistId),

    // Index for finding tracks by artist and role
    index("track_artists_artist_role_idx").on(table.artistId, table.role),

    // Index for ordering artists within a track
    index("track_artists_track_order_idx").on(table.trackId, table.order),

    // Unique constraint to prevent duplicate track-artist relationships
    uniqueIndex("unique_track_artist").on(
      table.trackId,
      table.artistId,
      table.role
    ),
  ]
);
