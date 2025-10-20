import React from "react";
import "./MediaHeader.scss";
import type { SongDetails } from "~/appData/models";
import { useCurrentPlayerStore } from "~/appData/currentPlayerStore";
import { toast } from "react-toastify";
import { useTranslation } from "~/lib/i18n/translations";

// Import remaining sub-components
import MediaCover from "./components/MediaCover/MediaCover";
import MediaMetadata, {
  type MediaMetadataProps,
} from "./components/MediaMetadata/MediaMetadata";
import MuzaButton from "~/controls/MuzaButton";
import MuzaIcon from "~/icons/MuzaIcon";
import { FaPause, FaPlay } from "react-icons/fa";
import { PlaylistVisibilityEnum } from "../../../server/db/playlist.entity";

interface MediaHeaderProps {
  // Generic media object that works for albums, playlists, etc.
  songs: SongDetails[];
  mediaType: "album" | "playlist" | "artist";
  title: string;
  imageSrc: string;
  creator?: string;
  visibility?: PlaylistVisibilityEnum;
  mediaMetadata: Omit<MediaMetadataProps, "type">;
  // Optional customization
  onInfoClick?: () => void;
  showBackButton?: boolean;
  customActions?: React.ReactNode;
}

const MediaHeader: React.FC<MediaHeaderProps> = ({
  songs,
  mediaType,
  title,
  imageSrc,
  creator,
  visibility,
  mediaMetadata,
  showBackButton = true,
  customActions,
  onInfoClick,
}) => {
  const { t } = useTranslation();
  const { setSelectedSong, isPlaying, setIsPlaying } = useCurrentPlayerStore();

  const addToLibrary = () => {
    toast(t(`${mediaType}.addedToLibrary`), {
      position: "bottom-center",
      hideProgressBar: true,
    });
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      // If currently playing, pause
      setIsPlaying(false);
    } else {
      if (songs.length > 0) {
        setSelectedSong(songs[0]);
        setIsPlaying(true);
      }
    }
  };

  const goBack = () => {
    window.history.back();
  };

  const getPlayButtonText = () => {
    switch (mediaType) {
      case "album":
        return isPlaying ? t("common.pause") : t("common.playAlbum");
      case "playlist":
        return isPlaying ? t("common.pause") : t("common.playPlaylist");
      case "artist":
        return isPlaying ? t("common.pause") : t("common.playArtist");
      default:
        return isPlaying ? t("common.pause") : t("common.play");
    }
  };

  return (
    <>
      <div
        className={`media-header-layout ${showBackButton ? "has-back-button" : ""}`}
      >
        {showBackButton && (
          <div className="back-close-section" data-name="back & close">
            <MuzaButton
              iconName="ChevronDown"
              onClick={goBack}
              size="small"
              className="back-button"
              data-name="back"
            />
          </div>
        )}

        <div className="media-header" data-name="Media-Header">
          <div className="media-content-section media-content-section--horizontal">
            <MediaCover
              imageSrc={imageSrc}
              title={title}
              mediaType={mediaType}
            />

            <div className="info-section">
              <div className="titles-section" data-name="Titles">
                <div className="title-metadata-group">
                  {/* Playlist Badge and Metadata */}
                  {mediaType === "playlist" && (
                    <div className="playlist-badge-section">
                      <div className="playlist-badge" data-name="Badge">
                        <div className="badge-icon">
                          <MuzaIcon iconName="ListMusic" />
                        </div>
                        <span className="badge-text">Playlist</span>
                      </div>
                      <span className="metadata-separator">•</span>
                      <span className="metadata-text">
                        {songs.length} Songs
                      </span>
                      <span className="metadata-separator">•</span>
                      <span className="metadata-text">
                        {Math.floor(
                          songs.reduce(
                            (total, song) => total + (song.time || 0),
                            0
                          ) / 60
                        )}
                        h{" "}
                        {Math.floor(
                          songs.reduce(
                            (total, song) => total + (song.time || 0),
                            0
                          ) % 60
                        )}
                        min
                      </span>
                    </div>
                  )}

                  {/* Title */}
                  <div className="title-info title-info--left">
                    <div className="album-title">{title}</div>
                    {creator && (
                      <div className="playlist-description">{creator}</div>
                    )}
                  </div>

                  {/* User Info Section for Playlists */}
                  {mediaType === "playlist" && (
                    <div className="user-info-section">
                      <div className="user-info">
                        <div className="user-avatar">
                          <img src="/art/imag_1.jpg" alt="User Avatar" />
                        </div>
                        <span className="user-name">User&apos;s Name</span>
                      </div>
                      <div className="visibility-badge" data-name="Badge">
                        <div className="badge-icon">
                          <MuzaIcon iconName="globe" />
                        </div>
                        <span className="badge-text">
                          {visibility === PlaylistVisibilityEnum.Private
                            ? t("common.private")
                            : t("common.public")}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Non-playlist metadata */}
                  {mediaType !== "playlist" && (
                    <MediaMetadata type={mediaType} {...mediaMetadata} />
                  )}
                </div>

                <div className="actions-section">
                  {/* PlayButton content inlined */}
                  <div className="ctas-section" data-name="CTAs">
                    <button
                      className="play-album-button"
                      onClick={handlePlayPause}
                      disabled={songs.length === 0}
                      data-name="Button"
                    >
                      <div className="play-icon">
                        {isPlaying ? <FaPause /> : <FaPlay />}
                      </div>
                      <span className="play-text">{getPlayButtonText()}</span>
                    </button>
                  </div>

                  {/* ActionButtonGroup content inlined */}
                  <div className="action-buttons action-buttons--end action-buttons--gap-medium">
                    {customActions || (
                      <>
                        <MuzaButton
                          iconName="plus"
                          onClick={addToLibrary}
                          size="medium"
                          data-name="Add-Download Button"
                        />
                        <MuzaButton
                          iconName="info"
                          onClick={onInfoClick}
                          size="medium"
                          data-name="Info Button"
                        />
                        <MuzaButton
                          iconName="ellipsis"
                          onClick={() => {}}
                          size="medium"
                          data-name="Menu Button"
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MediaHeader;
