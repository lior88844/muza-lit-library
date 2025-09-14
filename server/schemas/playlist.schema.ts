import { z } from 'zod';

// Playlist schemas
export const PlaylistSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  coverImage: z.string().url().optional(),
  isPublic: z.boolean().default(false),
  userId: z.string().max(255), // Cognito user ID
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreatePlaylistSchema = PlaylistSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  name: z.string().min(1).max(255),
});

export const UpdatePlaylistSchema = CreatePlaylistSchema.partial().extend({
  id: z.number(),
});

// Playlist tracks junction table schema
export const PlaylistTrackSchema = z.object({
  id: z.number(),
  playlistId: z.number(),
  trackId: z.number(),
  position: z.number().int().positive(),
  addedAt: z.date(),
});

export const CreatePlaylistTrackSchema = PlaylistTrackSchema.omit({
  id: true,
  addedAt: true,
}).extend({
  playlistId: z.number(),
  trackId: z.number(),
  position: z.number().int().positive(),
});

export const UpdatePlaylistTrackSchema =
  CreatePlaylistTrackSchema.partial().extend({
    id: z.number(),
  });

// Type exports
export type Playlist = z.infer<typeof PlaylistSchema>;
export type CreatePlaylist = z.infer<typeof CreatePlaylistSchema>;
export type UpdatePlaylist = z.infer<typeof UpdatePlaylistSchema>;

export type PlaylistTrack = z.infer<typeof PlaylistTrackSchema>;
export type CreatePlaylistTrack = z.infer<typeof CreatePlaylistTrackSchema>;
export type UpdatePlaylistTrack = z.infer<typeof UpdatePlaylistTrackSchema>;
