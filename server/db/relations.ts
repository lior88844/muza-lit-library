import { relations } from 'drizzle-orm'

import { albums } from './album.entity'
import { albumArtists } from './album-artist.entity'
import { albumLabels } from './album-label.entity'
import { artists } from './artist.entity'
import { labels } from './label.entity'
import { playlists } from './playlist.entity'
import { playlistShares } from './playlist-shares.entity'
import { playlistTracks } from './playlist-tracks.entity'
import { tracks } from './track.entity'
import { trackArtists } from './track-artist.entity'
import { userLibrary } from './user-library.entity'

// Relations
export const artistsRelations = relations(artists, ({ many }) => ({
  albums: many(albums),
  trackArtists: many(trackArtists),
  albumArtists: many(albumArtists),
}))

export const albumsRelations = relations(albums, ({ many }) => ({
  tracks: many(tracks),
  albumArtists: many(albumArtists),
  albumLabels: many(albumLabels),
}))

export const tracksRelations = relations(tracks, ({ one, many }) => ({
  album: one(albums, { fields: [tracks.albumId], references: [albums.id] }),
  trackArtists: many(trackArtists),
}))

export const trackArtistsRelations = relations(trackArtists, ({ one }) => ({
  track: one(tracks, {
    fields: [trackArtists.trackId],
    references: [tracks.id],
  }),
  artist: one(artists, {
    fields: [trackArtists.artistId],
    references: [artists.id],
  }),
}))

export const albumArtistsRelations = relations(albumArtists, ({ one }) => ({
  album: one(albums, {
    fields: [albumArtists.albumId],
    references: [albums.id],
  }),
  artist: one(artists, {
    fields: [albumArtists.artistId],
    references: [artists.id],
  }),
}))

export const labelsRelations = relations(labels, ({ many }) => ({
  albumLabels: many(albumLabels),
}))

export const albumLabelsRelations = relations(albumLabels, ({ one }) => ({
  album: one(albums, {
    fields: [albumLabels.albumId],
    references: [albums.id],
  }),
  label: one(labels, {
    fields: [albumLabels.labelId],
    references: [labels.id],
  }),
}))

export const playlistsRelations = relations(playlists, ({ many }) => ({
  tracks: many(playlistTracks),
  shares: many(playlistShares),
}))

export const playlistTracksRelations = relations(playlistTracks, ({ one }) => ({
  playlist: one(playlists, {
    fields: [playlistTracks.playlistId],
    references: [playlists.id],
  }),
  track: one(tracks, {
    fields: [playlistTracks.trackId],
    references: [tracks.id],
  }),
}))

export const playlistSharesRelations = relations(playlistShares, ({ one }) => ({
  playlist: one(playlists, {
    fields: [playlistShares.playlistId],
    references: [playlists.id],
  }),
}))

export const userLibraryRelations = relations(userLibrary, () => ({}))
