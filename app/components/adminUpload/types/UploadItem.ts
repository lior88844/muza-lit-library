import type { SimpleFlacMetadata } from "../../../lib/utils/simpleFlacMetadata";
import type { AlbumLookupResult } from "./DiscoverResponse";
import type { UploadErrorCodeEnum } from "./ErrorCode";

export interface UploadItem {
  id: string;
  name: string;
  type: "folder";
  size: number;
  files: File[]; // Array of files in the folder
  path: string;
  errorCode?: UploadErrorCodeEnum; // Optional error code
  metadata?: SimpleFlacMetadata; // Extracted FLAC metadata
  albumLookup?: AlbumLookupResult; // Backend lookup result
  isLookingUp?: boolean; // Whether we're currently looking up the album
  manualAlbumId?: number; // Manually entered album ID
  coverImageUrl?: string; // Cover image URL
  loadingState?: {
    status: "loading" | "loaded" | "error";
    loadedFiles: number; // how many files read from disk
    totalFiles: number; // total files in folder
    progress: number; // 0-100 percentage
  };
  // Validation states for upload
  hasValidId?: boolean; // Whether album has a valid ID (from lookup or manual entry)
  hasValidCover?: boolean; // Whether album has a valid cover image
  isUploadReady?: boolean; // Whether album is ready for upload (has both ID and cover)
  isUploaded?: boolean; // Whether album has been uploaded
}
