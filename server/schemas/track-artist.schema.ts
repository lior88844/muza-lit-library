import { trackArtists, ArtistRoleEnum } from "server/db/track-artist.entity";
import {
  createSelectSchema,
  createInsertSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

// Artist role enum for validation
export const ArtistRoleSchema = z.enum(ArtistRoleEnum);

// Generate schemas from Drizzle table
export const TrackArtistSchema = createSelectSchema(trackArtists, {
  order: schema => schema.min(0),
});

export const CreateTrackArtistSchema = createInsertSchema(trackArtists, {
  order: schema => schema.min(0),
});

export const UpdateTrackArtistSchema = createUpdateSchema(trackArtists, {
  order: schema => schema.min(0),
});

// Extended track schema with artists - this is a composite schema that combines track data with artist relationships
export const TrackWithArtistsSchema = z.object({
  id: z.number(),
  title: z.string().min(1).max(255),
  sortTitle: z.string().max(255).optional(),
  disambiguation: z.string().max(255).optional(),
  albumId: z.number().optional(),
  trackNumber: z.number().int().positive().optional(),
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
  artists: z.array(TrackArtistSchema).default([]),
});

// Type exports
export type TrackArtist = z.infer<typeof TrackArtistSchema>;
export type CreateTrackArtist = z.infer<typeof CreateTrackArtistSchema>;
export type UpdateTrackArtist = z.infer<typeof UpdateTrackArtistSchema>;
export type TrackWithArtists = z.infer<typeof TrackWithArtistsSchema>;
export type ArtistRole = z.infer<typeof ArtistRoleSchema>;
