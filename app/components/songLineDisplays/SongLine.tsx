import React, { type MouseEventHandler, useState } from "react";
import "./SongLine.scss";
import type { SongDetails } from "../../appData/models";
import { formatSongNumber } from "../../appData/utils";
import MuzaIcon from "~/icons/MuzaIcon";
import { toast } from "react-toastify";
import { useTranslation } from "../../lib/i18n/translations";

interface SongLineProps {
  details: SongDetails;
  onClick: MouseEventHandler<HTMLDivElement>;
  isPlaying: boolean;
  mediaType?: "song" | "album";
}

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
};

const SongLine: React.FC<SongLineProps> = ({
  details,
  onClick,
  isPlaying,
  mediaType = "song",
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { t } = useTranslation();

  const addToLibrary = () => {
    toast(t(`${mediaType}.addedToLibrary`), {
      position: "bottom-center",
      hideProgressBar: true,
    });
  };

  const renderIcon = () => {
    if (isPlaying) {
      return (
        <div className="wave-container">
          <div className="bar" />
          <div className="bar" />
          <div className="bar" />
        </div>
      );
    }

    return (
      <>
        <span className="track-number">
          {formatSongNumber(details.index || 1)}
        </span>
        <span className="play-icon">
          <MuzaIcon iconName="play" />
        </span>
      </>
    );
  };

  return (
    <div
      className={`song-line-simple ${isPlaying ? "playing" : ""} ${isHovered ? "hovered" : ""}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="song-container">
        <div className="track-info">
          <div className="track-icon">{renderIcon()}</div>
          <span className="track-title">{details.title}</span>
          <span className="track-artist">{details.artist}</span>
        </div>
        <div className="track-actions">
          {isHovered && (
            <button
              className="ellipsis-btn"
              title="More options"
              onClick={e => {
                e.stopPropagation();
                // Handle more options
              }}
            >
              <MuzaIcon iconName="ellipsis" />
            </button>
          )}
          <button
            className="add-btn"
            title="Add to library"
            onClick={e => {
              e.stopPropagation();
              addToLibrary();
            }}
          >
            <MuzaIcon iconName="plus" />
          </button>
          <span className="track-duration">
            {details.time ? formatDuration(details.time) : ""}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SongLine;
