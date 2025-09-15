import { eq, desc, count, sql, and } from "drizzle-orm";
import { db } from "../db/connection";
import { albums, tracks } from "../db/schema";
import type { Album } from "server/schemas";

export class AlbumService {
  /**
   * Find many albums with pagination
   */
  async findMany(
    limit = 20,
    offset = 0
  ): Promise<{ albums: Album[]; total: number }> {
    const [albumsResult, totalResult] = await Promise.all([
      db
        .select()
        .from(albums)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(albums.createdAt)),
      db.select({ count: count() }).from(albums),
    ]);

    return {
      albums: albumsResult as Album[],
      total: totalResult[0].count,
    };
  }

  /**
   * Find album by ID
   */
  async findById(id: number): Promise<Album | null> {
    const result = await db
      .select()
      .from(albums)
      .where(eq(albums.id, id))
      .limit(1);

    return (result[0] as Album) ?? null;
  }

  /**
   * Find album by title and artist
   */
  async findByTitleAndArtist(
    title: string,
    artistId: number
  ): Promise<Album | null> {
    const result = await db
      .select()
      .from(albums)
      .where(and(eq(albums.title, title), eq(albums.artistId, artistId)))
      .limit(1);

    return (result[0] as Album) ?? null;
  }

  /**
   * Search albums by title
   */
  async searchByTitle(query: string, limit = 10): Promise<Album[]> {
    const searchPattern = `%${query}%`;

    const result = await db
      .select()
      .from(albums)
      .where(
        sql`${albums.title} ILIKE ${searchPattern} OR 
            ${albums.sortTitle} ILIKE ${searchPattern}`
      )
      .limit(limit)
      .orderBy(albums.title);

    return result as Album[];
  }

  /**
   * Find albums by artist
   */
  async findByArtist(artistId: number, limit = 20): Promise<Album[]> {
    const result = await db
      .select()
      .from(albums)
      .where(eq(albums.artistId, artistId))
      .limit(limit)
      .orderBy(desc(albums.releaseDate));

    return result as Album[];
  }

  /**
   * Find albums by year
   */
  async findByYear(year: number): Promise<Album[]> {
    const result = await db
      .select()
      .from(albums)
      .where(sql`EXTRACT(YEAR FROM ${albums.releaseDate}) = ${year}`)
      .orderBy(albums.title);

    return result as Album[];
  }

  /**
   * Find album by MusicBrainz ID
   */
  async findByMusicbrainzId(musicbrainzId: string): Promise<Album | null> {
    const result = await db
      .select()
      .from(albums)
      .where(eq(albums.musicbrainzId, musicbrainzId))
      .limit(1);

    return (result[0] as Album) ?? null;
  }

  /**
   * Get album with track count and duration
   */
  async findWithStats(
    id: number
  ): Promise<(Album & { trackCount: number; totalDuration: number }) | null> {
    const result = await db
      .select({
        id: albums.id,
        title: albums.title,
        sortTitle: albums.sortTitle,
        disambiguation: albums.disambiguation,
        artistId: albums.artistId,
        releaseDate: albums.releaseDate,
        originalReleaseDate: albums.originalReleaseDate,
        albumType: albums.albumType,
        status: albums.status,
        packaging: albums.packaging,
        country: albums.country,
        language: albums.language,
        script: albums.script,
        musicbrainzId: albums.musicbrainzId,
        musicbrainzReleaseGroupId: albums.musicbrainzReleaseGroupId,
        barcode: albums.barcode,
        catalogNumber: albums.catalogNumber,
        label: albums.label,
        coverArt: albums.coverArt,
        discCount: albums.discCount,
        duration: albums.duration,
        genres: albums.genres,
        tags: albums.tags,
        credits: albums.credits,
        notes: albums.notes,
        quality: albums.quality,
        popularity: albums.popularity,
        verified: albums.verified,
        lastUpdated: albums.lastUpdated,
        createdAt: albums.createdAt,
        updatedAt: albums.updatedAt,
        trackCount: sql<number>`(
          SELECT COUNT(*) FROM ${tracks} 
          WHERE ${tracks.albumId} = ${albums.id}
        )`,
        totalDuration: sql<number>`(
          SELECT COALESCE(SUM(${tracks.duration}), 0) FROM ${tracks} 
          WHERE ${tracks.albumId} = ${albums.id}
        )`,
      })
      .from(albums)
      .where(eq(albums.id, id))
      .limit(1);

    return (
      (result[0] as Album & { trackCount: number; totalDuration: number }) ??
      null
    );
  }

  /**
   * Get album statistics
   */
  async getStats(): Promise<{
    total: number;
    verified: number;
    withCover: number;
    typeDistribution: Record<string, number>;
    averageTrackCount: number;
  }> {
    const [
      totalResult,
      verifiedResult,
      withCoverResult,
      typeResult,
      avgTracksResult,
    ] = await Promise.all([
      db.select({ count: count() }).from(albums),
      db
        .select({ count: count() })
        .from(albums)
        .where(eq(albums.verified, true)),
      db
        .select({ count: count() })
        .from(albums)
        .where(sql`${albums.coverArt} IS NOT NULL`),
      db
        .select({
          type: albums.albumType,
          count: count(),
        })
        .from(albums)
        .groupBy(albums.albumType),
      db
        .select({
          avg: sql<number>`COALESCE(AVG(${albums.trackCount}), 0)`,
        })
        .from(albums),
    ]);

    const typeDistribution: Record<string, number> = {};
    typeResult.forEach(row => {
      const type = row.type || "Unknown";
      typeDistribution[type] = row.count;
    });

    return {
      total: totalResult[0].count,
      verified: verifiedResult[0].count,
      withCover: withCoverResult[0].count,
      typeDistribution,
      averageTrackCount: Math.round(avgTracksResult[0].avg),
    };
  }
}
