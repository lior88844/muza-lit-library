import { z } from 'zod';

// Upload schemas
export const FileUploadSchema = z.object({
  filename: z.string().min(1),
  mimetype: z.enum([
    'audio/flac',
    'audio/mpeg',
    'audio/wav',
    'audio/aac',
    'audio/ogg',
  ]),
  size: z.number().max(100 * 1024 * 1024), // 100MB limit
  buffer: z.instanceof(Buffer).optional(),
});

export const UploadResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  track: z.any().optional(), // Track type will be properly typed when imported
  error: z.string().optional(),
});

// Search schemas
export const SearchQuerySchema = z.object({
  query: z.string().min(1),
  limit: z.number().int().min(1).max(100).default(10),
  offset: z.number().int().min(0).default(0),
});

export const PaginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

// Auth schemas for AWS Cognito
export const CognitoUserSchema = z.object({
  sub: z.string().uuid(),
  email: z.string().email(),
  email_verified: z.boolean(),
  name: z.string().optional(),
  given_name: z.string().optional(),
  family_name: z.string().optional(),
  picture: z.string().url().optional(),
  groups: z.array(z.string()).default([]),
});

export const AuthContextSchema = z.object({
  user: CognitoUserSchema.optional(),
  isAuthenticated: z.boolean(),
  token: z.string().optional(),
});

// Type exports
export type FileUpload = z.infer<typeof FileUploadSchema>;
export type UploadResponse = z.infer<typeof UploadResponseSchema>;

export type SearchQuery = z.infer<typeof SearchQuerySchema>;
export type Pagination = z.infer<typeof PaginationSchema>;

export type CognitoUser = z.infer<typeof CognitoUserSchema>;
export type AuthContext = z.infer<typeof AuthContextSchema>;
