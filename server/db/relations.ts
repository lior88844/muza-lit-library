import { relations } from "drizzle-orm";
import { artists } from "./artist.entity";
import { albums } from "./album.entity";
import { tracks } from "./track.entity";
import { trackArtists } from "./track-artist.entity";

// Relations
export const artistsRelations = relations(artists, ({ many }) => ({
  albums: many(albums),
  trackArtists: many(trackArtists),
}));

export const albumsRelations = relations(albums, ({ one, many }) => ({
  artist: one(artists, { fields: [albums.artistId], references: [artists.id] }),
  tracks: many(tracks),
}));

export const tracksRelations = relations(tracks, ({ one, many }) => ({
  album: one(albums, { fields: [tracks.albumId], references: [albums.id] }),
  trackArtists: many(trackArtists),
}));

export const trackArtistsRelations = relations(trackArtists, ({ one }) => ({
  track: one(tracks, {
    fields: [trackArtists.trackId],
    references: [tracks.id],
  }),
  artist: one(artists, {
    fields: [trackArtists.artistId],
    references: [artists.id],
  }),
}));
