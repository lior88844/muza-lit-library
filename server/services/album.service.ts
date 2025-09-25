import { eq, desc, count } from "drizzle-orm";
import { db } from "../db/connection";
import { albums, ArtistRoleEnum } from "../db/schema";
import type { Album, Artist, Track } from "server/schemas";
import type { AlbumArtist } from "server/schemas/album-artist.schema";

// Types for transformed data
interface AlbumWithArtistsAndTracks extends Album {
  albumArtists: (AlbumArtist & { artist: Artist })[];
  tracks: { id: number }[];
}

export class AlbumService {
  /**
   * Find many albums with pagination
   */
  async findMany(limit = 20, offset = 0) {
    const albumsResult = await db.query.albums.findMany({
      limit,
      offset,
      with: {
        albumArtists: { with: { artist: true } },
        tracks: { columns: { id: true } },
      },
      orderBy: desc(albums.createdAt),
    });

    return {
      albums: this.transformAlbumData(albumsResult),
    };
  }

  /**
   * Transform album data for frontend consumption
   */
  transformAlbumData(albums: AlbumWithArtistsAndTracks[]) {
    return albums.map(album => {
      const mainArtist =
        album.albumArtists.find(
          artist => artist.role === ArtistRoleEnum.MainArtist
        ) || album.albumArtists[0];
      return {
        id: album.id,
        imageSrc: album.coverArt,
        title: album.title,
        subTitle: album.releaseDate,
        artist: mainArtist?.artist.name,
        songs: album.tracks.map(track => track.id),
      };
    });
  }
}
