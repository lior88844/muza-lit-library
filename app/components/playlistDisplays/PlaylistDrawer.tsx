import React, { useState, useCallback, useEffect } from "react";
import { useTranslation } from "~/lib/i18n/translations";
import MuzaIcon from "~/icons/MuzaIcon";
import MuzaButton from "~/controls/MuzaButton";
import MuzaInputField from "~/controls/MuzaInputField";
import type { MusicPlaylist } from "~/appData/models";
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
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    // Handle dropped files or data
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      // TODO: Process dropped files and add to playlist
    }
  }, []);

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
          <button className="playlist-drawer__button" onClick={handleClose}>
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
            />
            <MuzaInputField
              value={playlistDescription}
              onChange={e => setPlaylistDescription(e.target.value)}
              placeholder={t("playlist.enterDescription")}
              className="playlist-drawer__description-input"
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
            iconName="grip-vertical"
          />

          <MuzaInputField
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t("playlist.filterPlaceholder")}
            className="playlist-drawer__search-input"
            leadingIcon="search"
          />
        </div>

        <div className="playlist-drawer__song-list">
          <div
            className={`playlist-drawer__drop-zone ${isDragOver ? "playlist-drawer__drop-zone--active" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <span>{t("playlist.dropSongsHere")}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaylistDrawer;
