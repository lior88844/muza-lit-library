import type { DiscoverMetadata } from "~/lib/flacMetadata";
import { adminApiClient } from "./adminApiClient";
import type {
  AlbumLookupResult,
  DiscoverResponse,
} from "../types/DiscoverResponse";
import { UploadErrorCodeEnum } from "../types/ErrorCode";

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

    const result = response.data.results[0];

    return {
      mbId: result.mbId,
      discogsId: result.discogsId || null,
      coverUrl: result.coverUrl || null,
      albumName: result.albumName,
      artistName: result.artistName,
      error: result.error,
    };
  } catch (error) {
    console.error("Error discovering album:", error);
    return {
      mbId: null,
      discogsId: null,
      coverUrl: null,
      albumName: metadata.album,
      artistName: metadata.artist,
      error: UploadErrorCodeEnum.DISCOVERY_SERVICE_ERROR,
    };
  }
}
