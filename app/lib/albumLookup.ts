import type { SimpleFlacMetadata } from "./utils/simpleFlacMetadata";

export interface AlbumLookupResult {
  found: boolean;
  albumId?: number;
  confidence?: number;
  message?: string;
}

/**
 * Mock backend service to check if an album exists based on metadata
 * In a real implementation, this would make an API call to your backend
 */
export async function lookupAlbum(
  metadata: SimpleFlacMetadata
): Promise<AlbumLookupResult> {
  // Simulate network delay
  await new Promise(resolve =>
    setTimeout(resolve, 1000 + Math.random() * 2000)
  );

  // Mock logic: randomly determine if album is found
  // In reality, this would search by album title, artist, and other metadata
  const found = Math.random() > 0.4; // 60% chance of finding the album

  if (found) {
    return {
      found: true,
      albumId: Math.floor(Math.random() * 10000) + 1,
      confidence: Math.floor(Math.random() * 30) + 70, // 70-100% confidence
      message: `Found album: "${metadata.album}" by ${metadata.albumartist || metadata.artist}`,
    };
  } else {
    return {
      found: false,
      message: `Album "${metadata.album}" by ${metadata.albumartist || metadata.artist} not found in database`,
    };
  }
}

/**
 * Real backend service call (commented out - implement when backend is ready)
 */
// export async function lookupAlbum(metadata: FlacMetadata): Promise<AlbumLookupResult> {
//   try {
//     const response = await fetch('/api/albums/lookup', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         title: metadata.album,
//         artist: metadata.albumartist || metadata.artist,
//         year: metadata.year,
//         musicbrainzId: metadata.musicbrainzAlbumId,
//       }),
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const result = await response.json();
//     return result;
//   } catch (error) {
//     console.error('Error looking up album:', error);
//     return {
//       found: false,
//       message: 'Error connecting to backend service'
//     };
//   }
// }
