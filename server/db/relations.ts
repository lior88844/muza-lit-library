import { relations } from "drizzle-orm";
import { artists } from "./artist.entity";
import { albums } from "./album.entity";
import { tracks } from "./track.entity";
import { trackArtists } from "./track-artist.entity";
import { albumArtists } from "./album-artist.entity";

// Relations
export const artistsRelations = relations(artists, ({ many }) => ({
  albums: many(albums),
  trackArtists: many(trackArtists),
  albumArtists: many(albumArtists),
}));

export const albumsRelations = relations(albums, ({ many }) => ({
  tracks: many(tracks),
  albumArtists: many(albumArtists),
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

export const albumArtistsRelations = relations(albumArtists, ({ one }) => ({
  album: one(albums, {
    fields: [albumArtists.albumId],
    references: [albums.id],
  }),
  artist: one(artists, {
    fields: [albumArtists.artistId],
    references: [artists.id],
  }),
}));
