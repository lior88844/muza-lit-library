import { parseBlob } from "music-metadata";

export interface FlacMetadata {
  title?: string;
  artist?: string;
  album?: string;
  albumartist?: string;
  year?: number;
  genre?: string;
  track?: { no: number; of?: number };
  disk?: { no: number; of?: number };
  duration?: number;
  musicbrainzAlbumId?: string;
  musicbrainzArtistId?: string;
  musicbrainzReleaseGroupId?: string;
}

/**
 * Extract metadata from a FLAC file
 */
export async function extractFlacMetadata(
  file: File
): Promise<FlacMetadata | null> {
  try {
    const metadata = await parseBlob(file);

    return {
      title: metadata.common.title,
      artist: metadata.common.artist,
      album: metadata.common.album,
      albumartist: metadata.common.albumartist,
      year: metadata.common.year,
      genre: Array.isArray(metadata.common.genre)
        ? metadata.common.genre.join(", ")
        : typeof metadata.common.genre === "string"
          ? metadata.common.genre
          : undefined,
      track:
        metadata.common.track && metadata.common.track.no !== null
          ? {
              no: metadata.common.track.no,
              of: metadata.common.track.of || undefined,
            }
          : undefined,
      disk:
        metadata.common.disk && metadata.common.disk.no !== null
          ? {
              no: metadata.common.disk.no,
              of: metadata.common.disk.of || undefined,
            }
          : undefined,
      duration: metadata.format.duration,
      musicbrainzAlbumId: Array.isArray(metadata.common.musicbrainz_albumid)
        ? metadata.common.musicbrainz_albumid[0]
        : metadata.common.musicbrainz_albumid,
      musicbrainzArtistId: Array.isArray(metadata.common.musicbrainz_artistid)
        ? metadata.common.musicbrainz_artistid[0]
        : metadata.common.musicbrainz_artistid,
      musicbrainzReleaseGroupId: Array.isArray(
        metadata.common.musicbrainz_releasegroupid
      )
        ? metadata.common.musicbrainz_releasegroupid[0]
        : metadata.common.musicbrainz_releasegroupid,
    };
  } catch (error) {
    // Error extracting FLAC metadata - could add proper logging here
    return null;
  }
}

/**
 * Extract metadata from the first FLAC file in a folder to represent the album
 */
export async function extractAlbumMetadata(
  files: File[]
): Promise<FlacMetadata | null> {
  const flacFiles = files.filter(
    file =>
      file.name.toLowerCase().endsWith(".flac") || file.type === "audio/flac"
  );

  if (flacFiles.length === 0) {
    return null;
  }

  // Use the first FLAC file to get album metadata
  return await extractFlacMetadata(flacFiles[0]);
}
