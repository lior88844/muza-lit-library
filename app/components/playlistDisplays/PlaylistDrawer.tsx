import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "~/lib/i18n/translations";
import MuzaIcon from "~/icons/MuzaIcon";
import MuzaButton from "~/controls/MuzaButton";
import MuzaInputField from "~/controls/MuzaInputField";
import type { MusicPlaylist, SongDetails } from "~/appData/models";
import { useMusicLibraryStore } from "~/appData/musicStore";
import SongLineWithCover from "~/components/songLineDisplays/SongLineWithCover";
import "./PlaylistDrawer.scss";

interface PlaylistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  playlist?: MusicPlaylist;
  onSavePlaylist: (playlist: Partial<MusicPlaylist>) => void;
}

const PlaylistDrawer: React.FC<PlaylistDrawerProps> = ({
  isOpen,
  onClose,
  playlist,
  onSavePlaylist,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { updatePlaylist } = useMusicLibraryStore();
  const [playlistName, setPlaylistName] = useState(playlist?.title || "");
  const [playlistDescription, setPlaylistDescription] = useState(
    playlist?.description || ""
  );
  const [isPublic, setIsPublic] = useState<boolean>(
    playlist?.visibility === "Public" || true
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  // Update playlist name, description and visibility when playlist prop changes
  useEffect(() => {
    if (playlist?.title) {
      setPlaylistName(playlist.title);
    }
    if (playlist?.description) {
      setPlaylistDescription(playlist.description);
    }
    if (playlist?.visibility) {
      setIsPublic(playlist.visibility === "Public");
    }
  }, [playlist?.title, playlist?.description, playlist?.visibility]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  // Helper functions for adding items to playlist
  const addSongToPlaylist = useCallback(
    (song: SongDetails) => {
      if (!playlist?.id) return;

      // Check if song already exists in playlist
      const existingSong = playlist.songs?.find(
        existingSong =>
          existingSong.id === song.id ||
          (existingSong.title === song.title &&
            existingSong.artist === song.artist)
      );

      if (existingSong) {
        return;
      }

      const updatedSongs = [...(playlist.songs || []), song];
      updatePlaylist(playlist.id, { songs: updatedSongs });
      onSavePlaylist({ songs: updatedSongs });
    },
    [playlist, updatePlaylist, onSavePlaylist]
  );

  // Helper function for removing songs from playlist
  const removeSongFromPlaylist = useCallback(
    (songToRemove: SongDetails) => {
      if (!playlist?.id) return;

      const updatedSongs =
        playlist.songs?.filter(
          song =>
            song.id !== songToRemove.id &&
            !(
              song.title === songToRemove.title &&
              song.artist === songToRemove.artist
            )
        ) || [];

      updatePlaylist(playlist.id, { songs: updatedSongs });
      onSavePlaylist({ songs: updatedSongs });
    },
    [playlist, updatePlaylist, onSavePlaylist]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      // Handle dropped files or data
      const files = Array.from(e.dataTransfer.files);
      const dragData = e.dataTransfer.getData("application/json");

      if (files.length > 0) {
        // TODO: Process dropped files and add to playlist
      }

      if (dragData) {
        try {
          const data = JSON.parse(dragData);

          // Handle only songs
          if (data.type === "song" && data.song) {
            addSongToPlaylist(data.song);
          }
        } catch (error) {
          // Silently handle parsing errors
        }
      }
    },
    [addSongToPlaylist]
  );

  const handleSave = () => {
    const updatedPlaylist = {
      ...playlist,
      title: playlistName,
      description: playlistDescription,
      visibility: isPublic ? "Public" : "Private",
    };
    onSavePlaylist(updatedPlaylist);
  };

  const handleClose = () => {
    onClose();
  };

  const handleNavigateToPlaylist = () => {
    if (playlist) {
      navigate("/playlist", { state: { playlist } });
      onClose(); // Close the drawer after navigation
    }
  };

  return (
    <div className={`playlist-drawer ${isOpen ? "playlist-drawer--open" : ""}`}>
      <div className="playlist-drawer__header">
        <div className="playlist-drawer__header-left">
          <div className="playlist-badge">
            <MuzaIcon iconName="playlist" />
            <span>{t("playlist.playlist")}</span>
          </div>
        </div>
        <div className="playlist-drawer__header-right">
          <button className="playlist-drawer__button" onClick={handleClose}>
            <MuzaIcon iconName="ellipsis" />
          </button>
          <button
            className="playlist-drawer__button"
            onClick={handleNavigateToPlaylist}
          >
            <MuzaIcon iconName="MoveDiagonal" />
          </button>
          <button className="playlist-drawer__button" onClick={handleClose}>
            <MuzaIcon iconName="Close" />
          </button>
        </div>
      </div>

      <div className="playlist-drawer__content">
        <div className="playlist-drawer__info">
          <div className="playlist-drawer__title-section">
            <MuzaInputField
              value={playlistName}
              onChange={e => setPlaylistName(e.target.value)}
              placeholder={t("playlist.enterName")}
              className="playlist-drawer__title-input"
              name="playlist-name"
            />
            <MuzaInputField
              value={playlistDescription}
              onChange={e => setPlaylistDescription(e.target.value)}
              placeholder={t("playlist.enterDescription")}
              className="playlist-drawer__description-input"
              name="playlist-description"
            />
          </div>

          <div className="playlist-drawer__visibility-section">
            <div className="playlist-drawer__visibility-badge">
              <MuzaIcon iconName="globe" />
              <span>
                {isPublic ? t("playlist.public") : t("playlist.private")}
              </span>
            </div>
          </div>
        </div>

        <div className="playlist-drawer__controls">
          <MuzaButton
            onClick={() => {}}
            className="playlist-drawer__sort-button"
            content={t("playlist.sort")}
            iconName="ArrowUpDown"
          />

          <MuzaInputField
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t("playlist.filterPlaceholder")}
            className="playlist-drawer__search-input"
            leadingIcon="search"
            name="playlist-drawer-search-input"
          />
        </div>

        <div className="playlist-drawer__song-list">
          {/* Main drop zone - always visible at the top */}
          <div
            className={`playlist-drawer__drop-zone ${isDragOver ? "playlist-drawer__drop-zone--active" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <span>{t("playlist.dropSongsHere")}</span>
          </div>

          {/* Display current playlist songs below the drop zone */}
          {playlist?.songs && playlist.songs.length > 0 && (
            <div className="playlist-drawer__songs">
              {playlist.songs.map((song, index) => (
                <div
                  key={song.id || index}
                  className="playlist-drawer__song-item"
                >
                  <SongLineWithCover
                    details={{ ...song, index: index + 1 }}
                    onClick={() => {}}
                    isPlaying={false}
                    showHoverActions={false}
                    playlistMode={true}
                    onRemoveSong={removeSongFromPlaylist}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistDrawer;
