import React, { useState } from "react";
import "./MediaHeader.scss";
import type {
  Album,
  SongDetails,
  MusicPlaylist,
  Artist,
} from "~/appData/models";
import { useCurrentPlayerStore } from "~/appData/currentPlayerStore";
import { toast } from "react-toastify";
import AlbumInfoModal from "~/components/albumDisplays/AlbumInfoModal";
import { useTranslation } from "~/lib/i18n/translations";

import MediaCover from "./components/MediaCover/MediaCover";
import MediaMetadata from "./components/MediaMetadata/MediaMetadata";
import MuzaButton from "~/controls/MuzaButton";
import { FaPause, FaPlay } from "react-icons/fa";

interface MediaHeaderProps {
  media: Album | MusicPlaylist | Artist;
  songs: SongDetails[];
  mediaType: "album" | "playlist" | "artist";
  showBackButton?: boolean;
  customActions?: React.ReactNode;
}

const MediaHeader: React.FC<MediaHeaderProps> = ({
  media,
  songs,
  mediaType,
  showBackButton = true,
  customActions,
}) => {
  const { t } = useTranslation();
  const selectedSong = useCurrentPlayerStore(state => state.selectedSong);
  const setSelectedSong = useCurrentPlayerStore(state => state.setSelectedSong);
  const setSelectedPlaListOrAlbum = useCurrentPlayerStore(state => state.setSelectedPlaListOrAlbum);
  const isPlaying = useCurrentPlayerStore(state => state.isPlaying);
  const setIsPlaying = useCurrentPlayerStore(state => state.setIsPlaying);
  const [isModalOpen, setModalOpen] = useState(false);

  const addToLibrary = () => {
    toast(t(`${mediaType}.addedToLibrary`), {
      position: "bottom-center",
      hideProgressBar: true,
    });
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (songs.length > 0) {
        setSelectedSong(songs[0]);
        setSelectedPlaListOrAlbum(media);
        setIsPlaying(true);
      }
    }
  };

  const goBack = () => {
    window.history.back();
  };

  const getMediaTitle = () => {
    if (mediaType === "artist") {
      return (media as Artist).name || "";
    }
    return (media as Album | MusicPlaylist).title || "";
  };

  const getMediaImageSrc = () => {
    if (mediaType === "artist") {
      return (media as Artist).imageUrl || "";
    }
    return (media as Album | MusicPlaylist).imageSrc || "";
  };

  const getCreatorInfo = () => {
    switch (mediaType) {
      case "album":
        return { creator: (media as Album).artist, label: "" };
      case "playlist":
        return {
          creator: (media as MusicPlaylist).author || "",
          label: t("common.by"),
        };
      case "artist":
        return { creator: "", label: "" };
      default:
        return { creator: "", label: "" };
    }
  };

  const getSongCount = () => {
    if (mediaType === "artist") {
      return (media as Artist).albumsCount;
    }
    return songs.length;
  };

  const getSongCountLabel = () => {
    if (mediaType === "artist") {
      return t("common.albums");
    }
    return t("common.songs");
  };

  return (
    <div className="media-header">
      <div className="media-header-content">
        {showBackButton && (
          <button className="back-button" onClick={goBack}>
            ← {t("action.back")}
          </button>
        )}

        <div className="media-info">
          <MediaCover
            imageSrc={getMediaImageSrc()}
            title={getMediaTitle()}
            mediaType={mediaType}
          />

          <MediaMetadata
            title={getMediaTitle()}
            creatorInfo={getCreatorInfo()}
            songCount={getSongCount()}
            songCountLabel={getSongCountLabel()}
          />
        </div>

        <div className="media-actions">
          <MuzaButton
            variant="primary"
            size="large"
            onClick={handlePlayPause}
            className="play-button"
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
            {isPlaying ? t("player.pause") : t("player.play")}
          </MuzaButton>

          <MuzaButton
            variant="secondary"
            size="medium"
            onClick={addToLibrary}
            className="add-to-library-button"
          >
            {t("action.addToLibrary")}
          </MuzaButton>

          {customActions}
        </div>
      </div>

      <AlbumInfoModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

export default MediaHeader;
