import { eq, desc, count, sql } from 'drizzle-orm';
import { db } from '../db/connection';
import {
  trackArtists,
  tracks,
  artists,
  ArtistRoleEnum,
  AudioFormatEnum,
} from '../db/schema';
import {
  type Track,
} from '../schemas/index';

export class TrackService {
  /**
   * Map database track to Track type
   */
  private mapDbTrackToTrack(dbTrack: Record<string, unknown>): Track {
    return {
      id: dbTrack.id as number,
      title: dbTrack.title as string,
      sortTitle: (dbTrack.sortTitle as string) || undefined,
      disambiguation: (dbTrack.disambiguation as string) || undefined,
      albumId: (dbTrack.albumId as number) || undefined,
      trackNumber: (dbTrack.trackNumber as number) || undefined,
      discNumber: (dbTrack.discNumber as number) || 1,
      duration: (dbTrack.duration as number) || undefined,
      isrc: (dbTrack.isrc as string) || undefined,
      musicbrainzId: (dbTrack.musicbrainzId as string) || undefined,
      musicbrainzRecordingId:
        (dbTrack.musicbrainzRecordingId as string) || undefined,
      format: (dbTrack.format as AudioFormatEnum) || undefined,
      bitrate: dbTrack.bitrate
        ? parseFloat(dbTrack.bitrate as string)
        : undefined,
      sampleRate: (dbTrack.sampleRate as number) || undefined,
      channels: (dbTrack.channels as number) || undefined,
      encoding: (dbTrack.encoding as string) || undefined,
      genres: (dbTrack.genres as string[]) || [],
      tags: (dbTrack.tags as string[]) || [],
      explicit: (dbTrack.explicit as boolean) || false,
      playCount: (dbTrack.playCount as number) || 0,
      popularity: (dbTrack.popularity as number) || 0,
      verified: (dbTrack.verified as boolean) || false,
      lastPlayed: (dbTrack.lastPlayed as Date) || undefined,
      lastUpdated: dbTrack.lastUpdated as Date,
      createdAt: dbTrack.createdAt as Date,
      updatedAt: dbTrack.updatedAt as Date,
    };
  }

  /**
   * Find many tracks with pagination
   */
  async findMany(
    limit = 50,
    offset = 0
  ): Promise<{ tracks: Track[]; total: number }> {
    const [tracksResult, totalResult] = await Promise.all([
      db
        .select()
        .from(tracks)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(tracks.createdAt)),
      db.select({ count: count() }).from(tracks),
    ]);

    return {
      tracks: tracksResult.map(this.mapDbTrackToTrack),
      total: totalResult[0].count,
    };
  }

  /**
   * Find track by ID
   */
  async findById(id: number): Promise<Track | null> {
    const result = await db
      .select()
      .from(tracks)
      .where(eq(tracks.id, id))
      .limit(1);

    return result[0] ? this.mapDbTrackToTrack(result[0]) : null;
  }

  /**
   * Find track by UUID
   */
  async findByUuid(uuid: string): Promise<Track | null> {
    const result = await db
      .select()
      .from(tracks)
      .where(eq(tracks.musicbrainzId, uuid))
      .limit(1);

    return result[0] ? this.mapDbTrackToTrack(result[0]) : null;
  }

  /**
   * Search tracks by query
   */
  async search(query: string, limit = 10): Promise<Track[]> {
    const searchPattern = `%${query}%`;

    const result = await db
      .select()
      .from(tracks)
      .where(sql`${tracks.title} ILIKE ${searchPattern}`)
      .limit(limit)
      .orderBy(desc(tracks.createdAt));

    return result.map(this.mapDbTrackToTrack);
  }
   
  /**
   * Find tracks by artist using proper JOIN
   */
  async findByArtist(artistId: number, limit = 50): Promise<Track[]> {
    const result = await db
      .select()
      .from(tracks)
      .innerJoin(trackArtists, eq(tracks.id, trackArtists.trackId))
      .where(eq(trackArtists.artistId, artistId))
      .limit(limit)
      .orderBy(desc(tracks.createdAt));

    return result.map(this.mapDbTrackToTrack);
  }

  /**
   * Find tracks by album
   */
  async findByAlbum(albumId: number): Promise<Track[]> {
    const result = await db
      .select()
      .from(tracks)
      .where(eq(tracks.albumId, albumId))
      .orderBy(tracks.trackNumber, tracks.title);

    return result.map(this.mapDbTrackToTrack);
  }

  /**
   * Find tracks by genre
   */
  async findByGenre(genre: string, limit = 20): Promise<Track[]> {
    const result = await db
      .select()
      .from(tracks)
      .where(sql`${genre} = ANY(${tracks.genres})`)
      .limit(limit)
      .orderBy(desc(tracks.createdAt));

    return result.map(this.mapDbTrackToTrack);
  }

  /**
   * Increment play count
   */
  async incrementPlayCount(id: number): Promise<Track | null> {
    const result = await db
      .update(tracks)
      .set({
        playCount: sql`${tracks.playCount} + 1`,
        lastPlayed: new Date(),
        lastUpdated: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(tracks.id, id))
      .returning();

    return result[0] ? this.mapDbTrackToTrack(result[0]) : null;
  }

  /**
   * Find track by MusicBrainz ID
   */
  async findByMusicbrainzId(musicbrainzId: string): Promise<Track | null> {
    const result = await db
      .select()
      .from(tracks)
      .where(eq(tracks.musicbrainzId, musicbrainzId))
      .limit(1);

    return result[0] ? this.mapDbTrackToTrack(result[0]) : null;
  }

  /**
   * Find track by ISRC
   */
  async findByISRC(isrc: string): Promise<Track | null> {
    const result = await db
      .select()
      .from(tracks)
      .where(eq(tracks.isrc, isrc))
      .limit(1);

    return result[0] ? this.mapDbTrackToTrack(result[0]) : null;
  }

  /**
   * Find tracks with their artists (better approach using JOINs)
   */
  async findTracksWithArtists(
    limit = 50,
    offset = 0
  ): Promise<
    Array<
      Track & {
        artists: Array<{
          id: number;
          name: string;
          role: string;
          order: number;
        }>;
      }
    >
  > {
    const result = await db
      .select({
        // Track fields
        id: tracks.id,
        title: tracks.title,
        sortTitle: tracks.sortTitle,
        disambiguation: tracks.disambiguation,
        albumId: tracks.albumId,
        trackNumber: tracks.trackNumber,
        discNumber: tracks.discNumber,
        duration: tracks.duration,
        isrc: tracks.isrc,
        musicbrainzId: tracks.musicbrainzId,
        musicbrainzRecordingId: tracks.musicbrainzRecordingId,
        fileId: tracks.fileId,
        format: tracks.format,
        bitrate: tracks.bitrate,
        sampleRate: tracks.sampleRate,
        channels: tracks.channels,
        encoding: tracks.encoding,
        genres: tracks.genres,
        tags: tracks.tags,
        explicit: tracks.explicit,
        playCount: tracks.playCount,
        popularity: tracks.popularity,
        verified: tracks.verified,
        lastPlayed: tracks.lastPlayed,
        lastUpdated: tracks.lastUpdated,
        createdAt: tracks.createdAt,
        updatedAt: tracks.updatedAt,
        // Artist fields
        artistId: artists.id,
        artistName: artists.name,
        artistRole: trackArtists.role,
        artistOrder: trackArtists.order,
      })
      .from(tracks)
      .innerJoin(trackArtists, eq(tracks.id, trackArtists.trackId))
      .innerJoin(artists, eq(trackArtists.artistId, artists.id))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(tracks.createdAt), trackArtists.order);

    // Group by track and collect artists
    const trackMap = new Map<
      number,
      Track & {
        artists: Array<{
          id: number;
          name: string;
          role: string;
          order: number;
        }>;
      }
    >();

    result.forEach(row => {
      if (!trackMap.has(row.id)) {
        const track = this.mapDbTrackToTrack(row);
        trackMap.set(row.id, {
          ...track,
          artists: [],
        });
      }

      trackMap.get(row.id)!.artists.push({
        id: row.artistId,
        name: row.artistName,
        role: row.artistRole,
        order: row.artistOrder || 0,
      });
    });

    return Array.from(trackMap.values());
  }

  /**
   * Find tracks where artist is the main artist
   */
  async findMainArtistTracks(artistId: number, limit = 50): Promise<Track[]> {
    const result = await db
      .select()
      .from(tracks)
      .innerJoin(trackArtists, eq(tracks.id, trackArtists.trackId))
      .where(
        sql`${trackArtists.artistId} = ${artistId} AND ${trackArtists.role} = '${ArtistRoleEnum.MainArtist}'`
      )
      .limit(limit)
      .orderBy(desc(tracks.createdAt));

    return result.map(this.mapDbTrackToTrack);
  }

  /**
   * Get track statistics
   */
  async getStats(): Promise<{
    total: number;
    totalDuration: number;
    averageDuration: number;
    formatDistribution: Record<string, number>;
  }> {
    const [totalResult, durationResult, formatResult] = await Promise.all([
      db.select({ count: count() }).from(tracks),
      db
        .select({
          totalDuration: sql<number>`COALESCE(SUM(${tracks.duration}), 0)`,
          avgDuration: sql<number>`COALESCE(AVG(${tracks.duration}), 0)`,
        })
        .from(tracks),
      db
        .select({
          format: tracks.format,
          count: count(),
        })
        .from(tracks)
        .groupBy(tracks.format),
    ]);

    const formatDistribution: Record<string, number> = {};
    formatResult.forEach(row => {
      if (row.format) {
        formatDistribution[row.format] = row.count;
      }
    });

    return {
      total: totalResult[0].count,
      totalDuration: durationResult[0].totalDuration,
      averageDuration: Math.round(durationResult[0].avgDuration),
      formatDistribution,
    };
  }
}
