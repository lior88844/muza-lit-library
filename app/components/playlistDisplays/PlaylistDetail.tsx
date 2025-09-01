import React, { useState } from "react";
import "./PlaylistDetail.scss";
import type { MusicPlaylist, SongDetails } from "~/appData/models";
import { useCurrentPlayerStore } from "~/appData/currentPlayerStore";
import { useMusicLibraryStore } from "~/appData/musicStore";
import MediaHeader from "~/components/MediaHeader/MediaHeader";
import SongLineWithCover from "~/components/songLineDisplays/SongLineWithCover";
import MuzaButton from "~/controls/MuzaButton";
import { useTranslation } from "~/lib/i18n/translations";

interface PlaylistDetailProps {
  playlist: MusicPlaylist;
}

const PlaylistDetail: React.FC<PlaylistDetailProps> = ({ playlist }) => {
  const { t } = useTranslation();
  const {
    selectedSong,
    setSelectedSong,
    setSelectedPlaListOrAlbum,
    isPlaying,
    setIsPlaying,
    togglePlayPause,
  } = useCurrentPlayerStore();
  const { recentlyPlayed } = useMusicLibraryStore();

  // For demo purposes, use some songs from recentlyPlayed as playlist songs
  // In a real app, the playlist would have its own songs array
  const playlistSongs = recentlyPlayed.slice(0, 8);

  const handleSongClick = (song: SongDetails) => {
    if (selectedSong?.id === song.id) {
      // If the same song is clicked, toggle play/pause
      togglePlayPause();
    } else {
      // If a different song is clicked, select it and start playing
      setSelectedSong(song);
      setIsPlaying(true);
    }
  };

  const isCurrentSongPlaying = (song: SongDetails) => {
    return selectedSong?.id === song.id && !!isPlaying;
  };

  return (
    <div className="playlist-detail">
      <div className="playlist-detail__container">
        <MediaHeader
          media={playlist}
          songs={playlistSongs}
          mediaType="playlist"
          showBackButton={true}
          customActions={
            <div className="playlist-actions">
              <MuzaButton
                iconName="plus"
                onClick={() => {}}
                size="medium"
                data-name="Add-Download Button"
              />
              <MuzaButton
                iconName="ellipsis"
                onClick={() => {}}
                size="medium"
                data-name="Menu Button"
              />
            </div>
          }
        />

        <div className="playlist-detail__song-list" data-name="Song List">
          {playlistSongs.map((song, index) => {
            // Show preview badge for first, fourth, sixth, seventh and eighth songs per Figma
            const showPreview = [3].includes(index);

            return (
              <div
                key={song.id}
                className={`playlist-detail__song-item ${isCurrentSongPlaying(song) ? "playing" : ""}`}
              >
                <SongLineWithCover
                  details={{ ...song, index: index + 1 }}
                  onClick={() => handleSongClick(song)}
                  isPlaying={isCurrentSongPlaying(song)}
                  showPreview={showPreview}
                  showHoverActions={true}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PlaylistDetail;
