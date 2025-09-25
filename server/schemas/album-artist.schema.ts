import { albumArtists } from "server/db/album-artist.entity";
import {
  createSelectSchema,
  createInsertSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

// Generate schemas from Drizzle table
export const AlbumArtistSchema = createSelectSchema(albumArtists, {
  order: schema => schema.min(0),
});

export const CreateAlbumArtistSchema = createInsertSchema(albumArtists, {
  order: schema => schema.min(0),
});

export const UpdateAlbumArtistSchema = createUpdateSchema(albumArtists, {
  order: schema => schema.min(0),
});

// Extended track schema with artists - this is a composite schema that combines track data with artist relationships
export const AlbumWithArtistsSchema = z.object({
  id: z.number(),
  title: z.string().min(1).max(255),
  sortTitle: z.string().max(255).optional(),
  disambiguation: z.string().max(255).optional(),
  albumId: z.number().optional(),
  trackNumber: z.number().int().positive().optional(),
  discNumber: z.number().int().positive().default(1),
  duration: z.number().int().positive().optional(),
  isrc: z.string().max(12).optional(),
  mbId: z.string().uuid().optional(),
  mbRecordingId: z.string().uuid().optional(),
  fileId: z.string().uuid().optional(),
  format: z.enum(["FLAC", "MP3", "WAV", "AAC", "OGG", "OPUS"]).optional(),
  bitrate: z.number().positive().optional(),
  sampleRate: z.number().int().positive().optional(),
  channels: z.number().int().min(1).max(8).optional(),
  encoding: z.string().max(50).optional(),
  genres: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  explicit: z.boolean().default(false),
  playCount: z.number().int().min(0).default(0),
  popularity: z.number().int().min(0).max(100).default(0),
  verified: z.boolean().default(false),
  lastPlayed: z.date().optional(),
  lastUpdated: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
  artists: z.array(AlbumArtistSchema).default([]),
});

// Type exports
export type AlbumArtist = z.infer<typeof AlbumArtistSchema>;
export type CreateAlbumArtist = z.infer<typeof CreateAlbumArtistSchema>;
export type UpdateAlbumArtist = z.infer<typeof UpdateAlbumArtistSchema>;
export type AlbumWithArtists = z.infer<typeof AlbumWithArtistsSchema>;
