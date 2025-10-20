import React, { useState } from "react";
import "./AlbumPreview.scss";
import type { Album } from "~/appData/models";
import { useCurrentPlayerStore } from "~/appData/currentPlayerStore";
import MuzaIcon from "~/icons/MuzaIcon";
import AlbumInfoModal from "./AlbumInfoModal";
import HoverOverlay from "~/components/ui/HoverOverlay";

interface AlbumPreviewProps {
  details: Album;
  onAlbumClick: () => void;
}

const AlbumPreview: React.FC<AlbumPreviewProps> = ({
  details,
  onAlbumClick,
}) => {
  const { isPlaying, setIsPlaying } = useCurrentPlayerStore();
  const [isModalOpen, setModalOpen] = useState(false);

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="album-details-card">
      <div className="image-container" onClick={onAlbumClick}>
        <img src={details.imageSrc} alt={details.title} />
        <HoverOverlay
          isPlaying={!!isPlaying}
          onPlayPause={handlePlayPause}
          actions={[
            {
              icon: "ellipsis",
              onClick: e => e.stopPropagation(),
              title: "More options",
            },
          ]}
        />
      </div>
      <div className="info">
        <div className="title">{details.title}</div>
        <div className="artist">{details.artist}</div>
        <div className="subtitle">{details.genre && `${details.genre} • `}</div>
        <div className="buttons">
          <button className="icon-button">
            <MuzaIcon iconName="dots" />
          </button>
          <button className="icon-button">
            <MuzaIcon iconName="info" />
          </button>
          <button className="icon-button">
            <MuzaIcon iconName="plus" />
          </button>
          <button className="icon-button">
            <MuzaIcon iconName="shuffle" />
          </button>
        </div>
      </div>
      <AlbumInfoModal
        // @ts-expect-error TODO: We need to get all album data always, somehow.
        album={details}
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

export default AlbumPreview;
