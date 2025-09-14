import { ArtistTypeEnum, GenderEnum } from 'server/db/artist.entity';
import { z } from 'zod';

// Artist schemas
export const ArtistSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(255),
  sortName: z.string().max(255).optional(),
  disambiguation: z.string().max(255).optional(),
  type: z.nativeEnum(ArtistTypeEnum).default(ArtistTypeEnum.Person),
  gender: z.nativeEnum(GenderEnum).default(GenderEnum.NotApplicable),
  area: z.string().max(255).optional(),
  beginDate: z.date().optional(),
  endDate: z.date().optional(),
  ended: z.boolean().default(false),
  musicbrainzId: z.string().uuid().optional(),
  biography: z.string().optional(),
  tags: z.array(z.string()).default([]),
  image: z.string().url().optional(),
  links: z.record(z.string()).optional(),
  isni: z.string().optional(),
  ipis: z.array(z.string()).default([]),
  popularity: z.number().int().min(0).max(100).default(0),
  verified: z.boolean().default(false),
  lastUpdated: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateArtistSchema = ArtistSchema.omit({
  id: true,
  lastUpdated: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  name: z.string().min(1).max(255),
});

export const UpdateArtistSchema = CreateArtistSchema.partial().extend({
  id: z.number(),
});

// Type exports
export type Artist = z.infer<typeof ArtistSchema>;
export type CreateArtist = z.infer<typeof CreateArtistSchema>;
export type UpdateArtist = z.infer<typeof UpdateArtistSchema>;
