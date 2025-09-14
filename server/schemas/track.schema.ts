import { AudioFormatEnum } from 'server/db/track.entity';
import { z } from 'zod';

// Track schemas
export const TrackSchema = z.object({
  id: z.number(),
  title: z.string().min(1).max(255),
  sortTitle: z.string().max(255).optional(),
  disambiguation: z.string().max(255).optional(),
  albumId: z.number().optional(),
  trackNumber: z.number().int().positive().optional(),
  discNumber: z.number().int().positive().default(1),
  duration: z.number().int().positive().optional(), // in seconds
  isrc: z.string().max(12).optional(),
  musicbrainzId: z.string().uuid().optional(),
  musicbrainzRecordingId: z.string().uuid().optional(),
  fileId: z.string().uuid().optional(),
  format: z.nativeEnum(AudioFormatEnum).optional(),
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
});
export const CreateTrackSchema = TrackSchema.omit({
  id: true,
  playCount: true,
  lastPlayed: true,
  lastUpdated: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  title: z.string().min(1).max(255),
});

export const UpdateTrackSchema = CreateTrackSchema.partial().extend({
  id: z.number(),
});

// Type exports
export type Track = z.infer<typeof TrackSchema>;
export type CreateTrack = z.infer<typeof CreateTrackSchema>;
export type UpdateTrack = z.infer<typeof UpdateTrackSchema>;
