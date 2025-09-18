import { artists } from "server/db/artist.entity";
import {
  createSelectSchema,
  createInsertSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

// Generate schemas from Drizzle table
export const ArtistSchema = createSelectSchema(artists, {
  name: schema => schema.min(1).max(255),
  sortName: schema => schema.max(255),
  disambiguation: schema => schema.max(255),
  area: schema => schema.max(255),
  isni: schema => schema.max(50),
  popularity: schema => schema.min(0).max(100),
});

export const CreateArtistSchema = createInsertSchema(artists, {
  name: schema => schema.min(1).max(255),
  sortName: schema => schema.max(255),
  disambiguation: schema => schema.max(255),
  area: schema => schema.max(255),
  isni: schema => schema.max(50),
  popularity: schema => schema.min(0).max(100),
});

export const UpdateArtistSchema = createUpdateSchema(artists, {
  name: schema => schema.min(1).max(255),
  sortName: schema => schema.max(255),
  disambiguation: schema => schema.max(255),
  area: schema => schema.max(255),
  isni: schema => schema.max(50),
  popularity: schema => schema.min(0).max(100),
});

// Type exports
export type Artist = z.infer<typeof ArtistSchema>;
export type CreateArtist = z.infer<typeof CreateArtistSchema>;
export type UpdateArtist = z.infer<typeof UpdateArtistSchema>;
