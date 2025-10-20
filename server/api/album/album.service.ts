import { desc } from "drizzle-orm";
import { db } from "../../db/connection";
import type { AlbumArtist } from "../../db/album-artist.entity";
import type { Artist } from "../../db/artist.entity";
import { albums, type Album } from "../../db/album.entity";
import type { MiniAlbumResponse } from "./types/MiniAlbumResponse";
import { formatTrack } from "../track/track.service";
import type { TrackWithArtists } from "../track/types/TrackWithArtists";
import type { AlbumResponse } from "./types/AlbumResponse";

// Types for transformed data
interface AlbumWithArtistsAndTracks extends Album {
  albumArtists: (AlbumArtist & { artist: Artist })[];
  tracks: TrackWithArtists[];
}

/**
 * Find many albums with pagination
 */
export async function findManyAlbums(limit = 20, offset = 0) {
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
    albums: formatMiniAlbum(albumsResult as AlbumWithArtistsAndTracks[]),
  };
}

/**
 * Find a single album by ID with full details
 */
export async function findAlbumById(id: number) {
  const albumResult = await db.query.albums.findFirst({
    where: (albums, { eq }) => eq(albums.id, id),
    with: {
      albumArtists: {
        with: { artist: true },
        orderBy: (albumArtists, { asc }) => [asc(albumArtists.order)],
      },
      tracks: {
        with: {
          trackArtists: { with: { artist: true } },
        },
        orderBy: (tracks, { asc }) => [asc(tracks.trackNumber)],
      },
    },
  });

  if (!albumResult) {
    return null;
  }

  return transformDetailedAlbumData(albumResult as AlbumWithArtistsAndTracks);
}

/**
 * Transform album data for frontend consumption
 */
function formatMiniAlbum(
  albums: AlbumWithArtistsAndTracks[]
): MiniAlbumResponse[] {
  return albums.map(album => {
    const mainArtist = album.albumArtists[0];
    return {
      id: album.id,
      imageSrc: album.coverArt || "",
      title: album.title,
      releaseDate: album.releaseDate,
      artist: mainArtist?.artist.name,
      songs: album.tracks.map(track => track.id),
    };
  });
}

/**
 * Transform detailed album data for frontend consumption
 */
function transformDetailedAlbumData(
  album: AlbumWithArtistsAndTracks
): AlbumResponse {
  return {
    ...album,
    artist: formatAlbumArtist(album.albumArtists[0]),
    otherArtists: album.albumArtists.slice(1).map(formatAlbumArtist),
    tracks: album.tracks.map(track => formatTrack(track)),
  };
}
const formatAlbumArtist = (albumArtist: AlbumArtist & { artist: Artist }) => {
  return {
    ...albumArtist,
    ...albumArtist.artist,
    artist: undefined,
  };
};
