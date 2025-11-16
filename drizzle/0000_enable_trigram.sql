-- Enable pg_trgm extension for trigram similarity search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create GIN indexes on albums searchable fields
CREATE INDEX IF NOT EXISTS albums_title_trgm_idx ON albums USING GIN (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS albums_sort_title_trgm_idx ON albums USING GIN (sort_title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS albums_disambiguation_trgm_idx ON albums USING GIN (disambiguation gin_trgm_ops);

-- Create GIN indexes on artists searchable fields
CREATE INDEX IF NOT EXISTS artists_name_trgm_idx ON artists USING GIN (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS artists_sort_name_trgm_idx ON artists USING GIN (sort_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS artists_disambiguation_trgm_idx ON artists USING GIN (disambiguation gin_trgm_ops);

-- Create GIN indexes on tracks searchable fields
CREATE INDEX IF NOT EXISTS tracks_title_trgm_idx ON tracks USING GIN (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS tracks_sort_title_trgm_idx ON tracks USING GIN (sort_title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS tracks_disambiguation_trgm_idx ON tracks USING GIN (disambiguation gin_trgm_ops);

-- Create GIN indexes on playlists searchable fields
CREATE INDEX IF NOT EXISTS playlists_name_trgm_idx ON playlists USING GIN (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS playlists_description_trgm_idx ON playlists USING GIN (description gin_trgm_ops);

-- Set similarity threshold for trigram matching (0.3 is a good balance)
-- This can be adjusted at runtime if needed
-- Note: This sets the session variable, actual implementation will use explicit thresholds