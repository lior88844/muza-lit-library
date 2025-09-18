import { albums } from "server/db/album.entity";
import {
  createSelectSchema,
  createInsertSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

// Generate schemas from Drizzle table
export const AlbumSchema = createSelectSchema(albums, {
  title: schema => schema.min(1).max(255),
  sortTitle: schema => schema.max(255),
  disambiguation: schema => schema.max(255),
  packaging: schema => schema.max(100),
  country: schema => schema.max(2), // ISO 3166-1 alpha-2
  language: schema => schema.max(3), // ISO 639-3
  script: schema => schema.max(4), // ISO 15924
  barcode: schema => schema.max(50),
  catalogNumber: schema => schema.max(100),
  label: schema => schema.max(255),
  coverArt: schema => schema.url(),
  trackCount: schema => schema.min(0),
  discCount: schema => schema.min(1),
  duration: schema => schema.min(0), // in seconds
  quality: schema => schema.min(0).max(100),
  popularity: schema => schema.min(0).max(100),
});

export const CreateAlbumSchema = createInsertSchema(albums, {
  title: schema => schema.min(1).max(255),
  sortTitle: schema => schema.max(255),
  disambiguation: schema => schema.max(255),
  packaging: schema => schema.max(100),
  country: schema => schema.max(2), // ISO 3166-1 alpha-2
  language: schema => schema.max(3), // ISO 639-3
  script: schema => schema.max(4), // ISO 15924
  barcode: schema => schema.max(50),
  catalogNumber: schema => schema.max(100),
  label: schema => schema.max(255),
  coverArt: schema => schema.url(),
  trackCount: schema => schema.min(0),
  discCount: schema => schema.min(1),
  duration: schema => schema.min(0), // in seconds
  quality: schema => schema.min(0).max(100),
  popularity: schema => schema.min(0).max(100),
});

export const UpdateAlbumSchema = createUpdateSchema(albums, {
  title: schema => schema.min(1).max(255),
  sortTitle: schema => schema.max(255),
  disambiguation: schema => schema.max(255),
  packaging: schema => schema.max(100),
  country: schema => schema.max(2), // ISO 3166-1 alpha-2
  language: schema => schema.max(3), // ISO 639-3
  script: schema => schema.max(4), // ISO 15924
  barcode: schema => schema.max(50),
  catalogNumber: schema => schema.max(100),
  label: schema => schema.max(255),
  coverArt: schema => schema.url(),
  trackCount: schema => schema.min(0),
  discCount: schema => schema.min(1),
  duration: schema => schema.min(0), // in seconds
  quality: schema => schema.min(0).max(100),
  popularity: schema => schema.min(0).max(100),
});

// Type exports
export type Album = z.infer<typeof AlbumSchema>;
export type CreateAlbum = z.infer<typeof CreateAlbumSchema>;
export type UpdateAlbum = z.infer<typeof UpdateAlbumSchema>;
