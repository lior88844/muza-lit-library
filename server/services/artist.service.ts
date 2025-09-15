import { eq, count, sql } from "drizzle-orm";
import { db } from "../db/connection";
import {
  artists,
  albums,
  tracks,
  ArtistTypeEnum,
  GenderEnum,
  trackArtists,
} from "../db/schema";
import type { Artist } from "server/schemas";

export class ArtistService {
  /**
   * Find many artists with pagination
   */
  async findMany(
    limit = 20,
    offset = 0
  ): Promise<{ artists: Artist[]; total: number }> {
    const [artistsResult, totalResult] = await Promise.all([
      db
        .select()
        .from(artists)
        .limit(limit)
        .offset(offset)
        .orderBy(artists.name),
      db.select({ count: count() }).from(artists),
    ]);

    return {
      artists: artistsResult as Artist[],
      total: totalResult[0].count,
    };
  }

  /**
   * Find artist by ID
   */
  async findById(id: number): Promise<Artist | null> {
    const result = await db
      .select()
      .from(artists)
      .where(eq(artists.id, id))
      .limit(1);

    return (result[0] as Artist) ?? null;
  }

  /**
   * Find artist by name
   */
  async findByName(name: string): Promise<Artist | null> {
    const result = await db
      .select()
      .from(artists)
      .where(eq(artists.name, name))
      .limit(1);

    return (result[0] as Artist) ?? null;
  }

  /**
   * Search artists by name
   */
  async searchByName(query: string, limit = 10): Promise<Artist[]> {
    const searchPattern = `%${query}%`;

    const result = await db
      .select()
      .from(artists)
      .where(
        sql`${artists.name} ILIKE ${searchPattern} OR 
            ${artists.sortName} ILIKE ${searchPattern}`
      )
      .limit(limit)
      .orderBy(artists.name);

    return result as Artist[];
  }

  /**
   * Find artist by MusicBrainz ID
   */
  async findByMusicbrainzId(musicbrainzId: string): Promise<Artist | null> {
    const result = await db
      .select()
      .from(artists)
      .where(eq(artists.musicbrainzId, musicbrainzId))
      .limit(1);

    return (result[0] as Artist) ?? null;
  }

  /**
   * Get artist with albums and tracks count
   */
  async findWithStats(
    id: number
  ): Promise<(Artist & { albumCount: number; trackCount: number }) | null> {
    const result = await db
      .select({
        id: artists.id,
        name: artists.name,
        sortName: artists.sortName,
        disambiguation: artists.disambiguation,
        type: artists.type,
        gender: artists.gender,
        area: artists.area,
        beginDate: artists.beginDate,
        endDate: artists.endDate,
        ended: artists.ended,
        musicbrainzId: artists.musicbrainzId,
        bio: artists.bio,
        tags: artists.tags,
        image: artists.image,
        links: artists.links,
        isni: artists.isni,
        ipis: artists.ipis,
        popularity: artists.popularity,
        verified: artists.verified,
        lastUpdated: artists.lastUpdated,
        createdAt: artists.createdAt,
        updatedAt: artists.updatedAt,
        albumCount: sql<number>`(
          SELECT COUNT(*) FROM ${albums} 
          WHERE ${albums.artistId} = ${artists.id}
        )`,
        trackCount: sql<number>`(
          SELECT COUNT(*) FROM ${tracks} 
          WHERE ${tracks.id} IN (
            SELECT ${trackArtists.trackId} FROM ${trackArtists} 
            WHERE ${trackArtists.artistId} = ${artists.id}
          )
        )`,
      })
      .from(artists)
      .where(eq(artists.id, id))
      .limit(1);

    return (
      (result[0] as Artist & { albumCount: number; trackCount: number }) ?? null
    );
  }

  /**
   * Get artist statistics
   */
  async getStats(): Promise<{
    total: number;
    verified: number;
    withImage: number;
    typeDistribution: Record<string, number>;
  }> {
    const [totalResult, verifiedResult, withImageResult, typeResult] =
      await Promise.all([
        db.select({ count: count() }).from(artists),
        db
          .select({ count: count() })
          .from(artists)
          .where(eq(artists.verified, true)),
        db
          .select({ count: count() })
          .from(artists)
          .where(sql`${artists.image} IS NOT NULL`),
        db
          .select({
            type: artists.type,
            count: count(),
          })
          .from(artists)
          .groupBy(artists.type),
      ]);

    const typeDistribution: Record<string, number> = {};
    typeResult.forEach(row => {
      const type = row.type || "Unknown";
      typeDistribution[type] = row.count;
    });

    return {
      total: totalResult[0].count,
      verified: verifiedResult[0].count,
      withImage: withImageResult[0].count,
      typeDistribution,
    };
  }
}
