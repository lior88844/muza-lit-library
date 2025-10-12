import type { DiscoverMetadata } from "~/lib/flacMetadata";
import { adminApiClient } from "./adminApiClient";

export interface AlbumLookupResult {
  found: boolean;
  mbId?: string;
  coverUrl?: string;
  message?: string;
}

interface DiscoverResponse {
  results: Array<{
    mbId: string;
    coverUrl: string;
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
      "/admin/discover",
      {
        metadata: [metadata],
      }
    );

    if (response.data.results && response.data.results.length > 0) {
      const result = response.data.results[0];
      return {
        found: true,
        mbId: result.mbId,
        coverUrl: result.coverUrl,
        message: `Found album: "${metadata.album}" by ${metadata.albumArtist}`,
      };
    } else {
      return {
        found: false,
        message: `Album "${metadata.album}" by ${metadata.albumArtist} not found`,
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
