import { desc, count } from "drizzle-orm";
import { db } from "../db/connection";
import { tracks, ArtistRoleEnum } from "../db/schema";
import {
  type Album,
  type Artist,
  type Track,
  type TrackArtist,
} from "../db/schema";

interface TrackWithArtists extends Track {
  trackArtists: (TrackArtist & { artist: Artist })[];
  album: Album | null;
}
function getTrackFilePathFromFileId(fileId: string) {
  return `https://${process.env.CDN_DOMAIN_NAME}/audio/hls/${fileId}/${fileId}.m3u8`;
}
export class TrackService {
  /**
   * Map database track to Track type
   */
  private mapDbTrackToTrack(dbTrack: TrackWithArtists) {
    const mainArtist = dbTrack.trackArtists.find(
      trackArtist => trackArtist.role === ArtistRoleEnum.MainArtist
    );
    return {
      id: dbTrack.id,
      index: dbTrack.id,
      title: dbTrack.title,
      time: dbTrack.duration,
      audioUrl: dbTrack.fileId
        ? getTrackFilePathFromFileId(dbTrack.fileId)
        : null,
      year: dbTrack.createdAt?.getFullYear() || "2023",
      artistId: mainArtist?.artistId,
      artist: mainArtist?.artist.name,
      album: dbTrack.album?.title,
      imageSrc: dbTrack.album?.coverArt || "https://via.placeholder.com/150",
    };
  }
  /**
   * Find many tracks with pagination
   */
  async findMany(limit = 50, offset = 0) {
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
      tracks: tracksResult.map(this.mapDbTrackToTrack),
      total: totalResult[0].count,
    };
  }
}
