import { AlbumTypeEnum, ReleaseStatusEnum } from "server/db/album.entity";
import { z } from "zod";

// Album schemas
export const AlbumSchema = z.object({
  id: z.number(),
  title: z.string().min(1).max(255),
  sortTitle: z.string().max(255).optional(),
  disambiguation: z.string().max(255).optional(),
  artistId: z.number(),
  releaseDate: z.date().optional(),
  originalReleaseDate: z.date().optional(),
  albumType: z.nativeEnum(AlbumTypeEnum).default(AlbumTypeEnum.Album),
  status: z.nativeEnum(ReleaseStatusEnum).default(ReleaseStatusEnum.Official),
  packaging: z.string().max(100).optional(),
  country: z.string().max(2).optional(), // ISO 3166-1 alpha-2
  language: z.string().max(3).optional(), // ISO 639-3
  script: z.string().max(4).optional(), // ISO 15924
  musicbrainzId: z.string().uuid().optional(),
  musicbrainzReleaseGroupId: z.string().uuid().optional(),
  barcode: z.string().max(50).optional(),
  catalogNumber: z.string().max(100).optional(),
  label: z.string().max(255).optional(),
  coverArt: z.string().url().optional(),
  trackCount: z.number().int().min(0).default(0),
  discCount: z.number().int().min(1).default(1),
  duration: z.number().int().min(0).optional(), // in seconds
  genres: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  credits: z.record(z.any()).optional(),
  notes: z.string().optional(),
  quality: z.number().int().min(0).max(100).default(0),
  popularity: z.number().int().min(0).max(100).default(0),
  verified: z.boolean().default(false),
  lastUpdated: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateAlbumSchema = AlbumSchema.omit({
  id: true,
  trackCount: true,
  lastUpdated: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  title: z.string().min(1).max(255),
  artistId: z.number(),
});

export const UpdateAlbumSchema = CreateAlbumSchema.partial().extend({
  id: z.number(),
});

// Type exports
export type Album = z.infer<typeof AlbumSchema>;
export type CreateAlbum = z.infer<typeof CreateAlbumSchema>;
export type UpdateAlbum = z.infer<typeof UpdateAlbumSchema>;
