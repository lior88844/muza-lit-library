import { ArtistRoleEnum } from 'server/db/track-artist.entity';
import { z } from 'zod';

// Artist role enum for validation
export const ArtistRoleSchema = z.nativeEnum(ArtistRoleEnum);

// Track-Artist relationship schemas
export const TrackArtistSchema = z.object({
  id: z.number(),
  trackId: z.number(),
  artistId: z.number(),
  role: ArtistRoleSchema,
  order: z.number().int().min(0).default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateTrackArtistSchema = TrackArtistSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  trackId: z.number(),
  artistId: z.number(),
  role: ArtistRoleSchema.default(ArtistRoleEnum.MainArtist),
});

export const UpdateTrackArtistSchema = CreateTrackArtistSchema.partial().extend(
  {
    id: z.number(),
  }
);

// Extended track schema with artists
export const TrackWithArtistsSchema = z.object({
  id: z.number(),
  title: z.string().min(1).max(255),
  sortTitle: z.string().max(255).optional(),
  disambiguation: z.string().max(255).optional(),
  albumId: z.number().optional(),
  trackNumber: z.number().int().positive().optional(),
  discNumber: z.number().int().positive().default(1),
  duration: z.number().int().positive().optional(),
  isrc: z.string().max(12).optional(),
  musicbrainzId: z.string().uuid().optional(),
  musicbrainzRecordingId: z.string().uuid().optional(),
  filePath: z.string().optional(),
  fileName: z.string().optional(),
  fileSize: z.string().optional(),
  format: z.enum(['FLAC', 'MP3', 'WAV', 'AAC', 'OGG', 'OPUS']).optional(),
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
