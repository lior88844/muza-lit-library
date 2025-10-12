import { tracks } from "server/db/track.entity";
import {
  createSelectSchema,
  createInsertSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

// Generate schemas from Drizzle table
export const TrackSchema = createSelectSchema(tracks, {
  title: schema => schema.min(1).max(255),
  sortTitle: schema => schema.max(255),
  disambiguation: schema => schema.max(255),
  trackNumber: schema => schema.positive(),
  duration: schema => schema.positive(), // in seconds
  isrc: schema => schema.max(12),
  encoding: schema => schema.max(50),
  channels: schema => schema.min(1).max(8),
  playCount: schema => schema.min(0),
  popularity: schema => schema.min(0).max(100),
});

export const CreateTrackSchema = createInsertSchema(tracks, {
  title: schema => schema.min(1).max(255),
  sortTitle: schema => schema.max(255),
  disambiguation: schema => schema.max(255),
  trackNumber: schema => schema.positive(),
  duration: schema => schema.positive(), // in seconds
  isrc: schema => schema.max(12),
  encoding: schema => schema.max(50),
  channels: schema => schema.min(1).max(8),
  playCount: schema => schema.min(0),
  popularity: schema => schema.min(0).max(100),
});

export const UpdateTrackSchema = createUpdateSchema(tracks, {
  title: schema => schema.min(1).max(255),
  sortTitle: schema => schema.max(255),
  disambiguation: schema => schema.max(255),
  trackNumber: schema => schema.positive(),
  duration: schema => schema.positive(), // in seconds
  isrc: schema => schema.max(12),
  encoding: schema => schema.max(50),
  channels: schema => schema.min(1).max(8),
  playCount: schema => schema.min(0),
  popularity: schema => schema.min(0).max(100),
});

// Type exports
export type Track = z.infer<typeof TrackSchema>;
export type CreateTrack = z.infer<typeof CreateTrackSchema>;
export type UpdateTrack = z.infer<typeof UpdateTrackSchema>;
