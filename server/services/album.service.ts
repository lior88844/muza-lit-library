import { desc } from "drizzle-orm";
import { db } from "../db/connection";
import type { AlbumArtist } from "server/db/album-artist.entity";
import type { Artist } from "server/db/artist.entity";
import { albums, type Album } from "server/db/album.entity";
import { ArtistRoleEnum } from "server/db/track-artist.entity";

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
      albums: this.transformAlbumData(
        albumsResult as AlbumWithArtistsAndTracks[]
      ),
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
