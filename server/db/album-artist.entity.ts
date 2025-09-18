import {
  pgTable,
  serial,
  integer,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { artists } from "./artist.entity";
import { albums } from "./album.entity";
import { ArtistRoleEnum } from "./track-artist.entity";

// Enum for artist roles in albums
export const albumArtistRoleEnum = pgEnum(
  "album_artist_role",
  Object.values(ArtistRoleEnum) as [string, ...string[]]
);

// Junction table for album-artist relationships
export const albumArtists = pgTable(
  "album_artists",
  {
    id: serial("id").primaryKey(),
    albumId: integer("album_id")
      .notNull()
      .references(() => albums.id, { onDelete: "cascade" }),
    artistId: integer("artist_id")
      .notNull()
      .references(() => artists.id, { onDelete: "cascade" }),
    role: albumArtistRoleEnum("role")
      .notNull()
      .default(ArtistRoleEnum.MainArtist),
    order: integer("order").default(0), // For ordering artists (main artist first, etc.)
  },
  table => [
    // Composite index for efficient album-artist lookups
    index("album_artist_idx").on(table.albumId, table.artistId),

    // Index for finding all albums by an artist
    index("album_artists_artist_idx").on(table.artistId),

    // Index for finding albums by artist and role
    index("album_artists_artist_role_idx").on(table.artistId, table.role),

    // Index for ordering artists within an album
    index("album_artists_album_order_idx").on(table.albumId, table.order),

    // Unique constraint to prevent duplicate album-artist relationships
    uniqueIndex("unique_album_artist").on(
      table.albumId,
      table.artistId,
      table.role
    ),
  ]
);
