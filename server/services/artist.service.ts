import type { AlbumArtist } from "../db/album-artist.entity";
import { db } from "../db/connection";
import type { Artist } from "../db/artist.entity";

// Types for transformed data
interface ArtistWithAlbums extends Artist {
  albumArtists: AlbumArtist[];
}

export class ArtistService {
  /**
   * Find many artists with pagination
   */
  async findMany(limit = 20, offset = 0) {
    const artistsResult = await db.query.artists.findMany({
      with: {
        albumArtists: true,
      },
      limit,
      offset,
    });
    return {
      artists: this.transformArtistData(artistsResult as ArtistWithAlbums[]),
    };
  }

  /**
   * Transform artist data for frontend consumption
   */
  transformArtistData(artists: ArtistWithAlbums[]) {
    return artists
      .filter(artist => artist.name)
      .map((artist, index) => ({
        id: artist.id || index + 1,
        index: index + 1,
        imageUrl: artist.image,
        name: artist.name,
        albumsCount: String(artist.albumArtists.length),
      }));
  }
}
