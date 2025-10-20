import { desc, count } from "drizzle-orm";
import { db } from "../../db/connection";
import { tracks } from "../../db/schema";
import type { TrackResponse } from "./types/TrackResponse";
import type { TrackWithArtists } from "./types/TrackWithArtists";

function getTrackFilePathFromFileId(fileId: string) {
  return `https://${process.env.CDN_DOMAIN_NAME}/audio/hls/${fileId}/${fileId}.m3u8`;
}

/**
 * Map database track to Track type
 */
export function formatTrack(dbTrack: TrackWithArtists): TrackResponse {
  const mainArtist = dbTrack.trackArtists[0];
  return {
    id: dbTrack.id,
    index: dbTrack.trackNumber || 0,
    title: dbTrack.title,
    time: dbTrack.duration,
    audioUrl: dbTrack.fileId ? getTrackFilePathFromFileId(dbTrack.fileId) : "",
    year: dbTrack.createdAt?.getFullYear() || 0,
    artistId: mainArtist?.artistId,
    artist: mainArtist?.artist.name,
    album: dbTrack.album?.title,
    imageSrc: dbTrack.album?.coverArt || "https://via.placeholder.com/150",
  };
}

/**
 * Find many tracks with pagination
 */
export async function findManyTracks(limit = 50, offset = 0) {
  const [tracksResult, totalResult] = await Promise.all([
    db.query.tracks.findMany({
      limit,
      offset,
      orderBy: desc(tracks.createdAt),
      with: {
        album: true,
        trackArtists: { with: { artist: true } },
      },
    }),
    db.select({ count: count() }).from(tracks),
  ]);

  return {
    tracks: tracksResult.map(formatTrack),
    total: totalResult[0].count,
  };
}
