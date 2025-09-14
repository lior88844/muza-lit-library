import {
  type TrackArtist,
  type ArtistRole,
} from '../schemas/index';

export class TrackArtistService {
  /**
   * Map database track-artist to TrackArtist type
   */
  private mapDbTrackArtistToTrackArtist(
    dbTrackArtist: Record<string, unknown>
  ): TrackArtist {
    return {
      id: dbTrackArtist.id as number,
      trackId: dbTrackArtist.trackId as number,
      artistId: dbTrackArtist.artistId as number,
      role: dbTrackArtist.role as ArtistRole,
      order: (dbTrackArtist.order as number) || 0,
      createdAt: dbTrackArtist.createdAt as Date,
      updatedAt: dbTrackArtist.updatedAt as Date,
    };
  }
}