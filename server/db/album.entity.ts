import {
  pgTable,
  serial,
  varchar,
  timestamp,
  integer,
  boolean,
  text,
  uuid,
  pgEnum,
  json,
} from "drizzle-orm/pg-core";
import { artists } from "./artist.entity";

export enum AlbumTypeEnum {
  Album = "Album",
  Single = "Single",
  EP = "EP",
  Compilation = "Compilation",
  Soundtrack = "Soundtrack",
  Live = "Live",
  Remix = "Remix",
  Other = "Other",
}

export enum ReleaseStatusEnum {
  Official = "Official",
  Promotion = "Promotion",
  Bootleg = "Bootleg",
  PseudoRelease = "Pseudo-Release",
}

export const albumTypeEnum = pgEnum(
  "album_type",
  Object.values(AlbumTypeEnum) as [string, ...string[]]
);
export const releaseStatusEnum = pgEnum(
  "release_status",
  Object.values(ReleaseStatusEnum) as [string, ...string[]]
);

// Albums table
export const albums = pgTable("albums", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  sortTitle: varchar("sort_title", { length: 255 }),
  disambiguation: varchar("disambiguation", { length: 255 }),
  artistId: integer("artist_id").references(() => artists.id),
  releaseDate: timestamp("release_date"),
  originalReleaseDate: timestamp("original_release_date"),
  albumType: albumTypeEnum("album_type").default("Album"),
  status: releaseStatusEnum("status").default("Official"),
  packaging: varchar("packaging", { length: 100 }),
  country: varchar("country", { length: 2 }), // ISO 3166-1 alpha-2
  language: varchar("language", { length: 3 }), // ISO 639-3
  script: varchar("script", { length: 4 }), // ISO 15924
  musicbrainzId: uuid("musicbrainz_id"),
  musicbrainzReleaseGroupId: uuid("musicbrainz_release_group_id"),
  barcode: varchar("barcode", { length: 50 }),
  catalogNumber: varchar("catalog_number", { length: 100 }),
  label: varchar("label", { length: 255 }),
  coverArt: text("cover_art"),
  trackCount: integer("track_count").default(0),
  discCount: integer("disc_count").default(1),
  duration: integer("duration"), // in seconds
  genres: text("genres").array(), // PostgreSQL array
  tags: text("tags").array(), // PostgreSQL array
  credits: json("credits").$type<Record<string, unknown>>(), // JSON object
  notes: text("notes"),
  quality: integer("quality").default(0),
  popularity: integer("popularity").default(0),
  verified: boolean("verified").default(false),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
