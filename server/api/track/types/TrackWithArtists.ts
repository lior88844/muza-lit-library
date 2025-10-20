import type { Album, Artist, Track, TrackArtist } from "../../../db/schema";

export interface TrackWithArtists extends Track {
  trackArtists: (TrackArtist & { artist: Artist })[];
  album: Album | null;
}
