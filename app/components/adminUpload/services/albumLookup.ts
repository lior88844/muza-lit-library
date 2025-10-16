import type { DiscoverMetadata } from "~/lib/flacMetadata";
import { adminApiClient } from "./adminApiClient";

export interface AlbumLookupResult {
  found: boolean;
  mbId?: string;
  coverUrl?: string;
  albumName?: string;
  artistName?: string;
  message?: string;
}

interface DiscoverResponse {
  results: Array<{
    mbId: string;
    coverUrl: string | null;
    albumName?: string;
    artistName?: string;
  }>;
}

/**
 * Call the admin discover endpoint to look up album information
 */
export async function discoverAlbum(
  metadata: DiscoverMetadata
): Promise<AlbumLookupResult> {
  try {
    const response = await adminApiClient.post<DiscoverResponse>(
      "/api/admin/discover",
      {
        metadata: [metadata],
      }
    );

    if (response.data.results && response.data.results.length > 0) {
      const result = response.data.results[0];

      // Extract album and artist names from response, fallback to metadata
      const albumName = result.albumName || metadata.album;
      const artistName = result.artistName || metadata.artist;

      return {
        found: true,
        mbId: result.mbId,
        coverUrl: result.coverUrl || undefined,
        albumName: result.albumName,
        artistName: result.artistName,
        message: `Found album: "${albumName}" by ${artistName}`,
      };
    } else {
      return {
        found: false,
        message: `Album "${metadata.album}" by ${metadata.artist} not found`,
      };
    }
  } catch (error) {
    console.error("Error discovering album:", error);
    return {
      found: false,
      message: "Error connecting to discovery service",
    };
  }
}
