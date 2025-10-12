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
  numeric,
} from "drizzle-orm/pg-core";
import { albums } from "./album.entity";

export enum AudioFormatEnum {
  FLAC = "FLAC",
  MP3 = "MP3",
  WAV = "WAV",
  AAC = "AAC",
  OGG = "OGG",
  OPUS = "OPUS",
}
// Enums
export const audioFormatEnum = pgEnum(
  "audio_format",
  Object.values(AudioFormatEnum) as [string, ...string[]]
);

// Tracks table
export const tracks = pgTable("tracks", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  sortTitle: varchar("sort_title", { length: 255 }),
  disambiguation: varchar("disambiguation", { length: 255 }),
  albumId: integer("album_id").references(() => albums.id),
  trackNumber: integer("track_number"),
  duration: integer("duration"), // in seconds
  isrc: varchar("isrc", { length: 12 }),
  mbId: uuid("mb_id"),
  mbRecordingId: uuid("mb_recording_id"),
  fileId: uuid("track_file_id"),
  format: audioFormatEnum("format"),
  bitrate: numeric("bitrate"),
  sampleRate: integer("sample_rate"),
  channels: integer("channels"),
  encoding: varchar("encoding", { length: 50 }),
  genres: text("genres").array(), // PostgreSQL array
  tags: text("tags").array(), // PostgreSQL array
  explicit: boolean("explicit").default(false),
  playCount: integer("play_count").default(0),
  popularity: integer("popularity").default(0),
  verified: boolean("verified").default(false),
  lastPlayed: timestamp("last_played"),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
