import React from "react";
import "./PlaylistCover.scss";
import HoverOverlay from "~/components/ui/HoverOverlay";
import DropdownMenu from "~/components/ui/DropdownMenu";
import type { DropdownMenuItem } from "~/components/ui/DropdownMenu";
import MuzaIcon from "~/icons/MuzaIcon";
import { useCurrentPlayerStore } from "~/appData/currentPlayerStore";
import type { MusicPlaylist } from "~/appData/models";

interface PlaylistCoverProps {
  albumImages: string[];
  title: string;
  songsCount: string;
  userName: string;
  playlist?: MusicPlaylist;
  onSelect?: (data: {
    title: string;
    songsCount: string;
    albumImages: string[];
    userName: string;
  }) => void;
}

const PlaylistCover: React.FC<PlaylistCoverProps> = ({
  albumImages,
  title,
  songsCount,
  userName,
  playlist,
  onSelect,
}) => {
  const { setSelectedSong, setSelectedPlaListOrAlbum, setIsPlaying } =
    useCurrentPlayerStore();

  const handleClick = () => {
    onSelect?.({ title, songsCount, albumImages, userName });
  };

  const handlePlayPlaylist = () => {
    if (playlist && playlist.songs && playlist.songs.length > 0) {
      setSelectedSong(playlist.songs[0]);
      setSelectedPlaListOrAlbum(playlist as any);
      setIsPlaying(true);
    }
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log("Share playlist:", title);
  };

  const handleMakePrivate = () => {
    // TODO: Implement make private functionality
    console.log("Make private playlist:", title);
  };

  const handleDeletePlaylist = () => {
    // TODO: Implement delete functionality
    console.log("Delete playlist:", title);
  };

  const dropdownMenuItems: DropdownMenuItem[] = [
    {
      id: "share",
      title: "Share",
      icon: "globe",
      onClick: handleShare,
    },
    {
      id: "make-private",
      title: "Make private",
      icon: "lock",
      onClick: handleMakePrivate,
    },
    {
      id: "delete",
      title: "Delete playlist",
      icon: "trash",
      onClick: handleDeletePlaylist,
      destructive: true,
    },
  ];

  // Ensure we have 4 images, pad with first image if needed
  const safeAlbumImages = Array.isArray(albumImages) ? albumImages : [];
  const paddedImages = [...safeAlbumImages];
  while (paddedImages.length < 4) {
    paddedImages.push(paddedImages[0] || "");
  }

  return (
    <div className="playlist-cover" onClick={handleClick}>
      <div className="playlist-cover__image-container">
        <div className="playlist-cover__collage">
          <div
            className="playlist-cover__image playlist-cover__image--top-left"
            style={{ backgroundImage: `url('${paddedImages[0]}')` }}
          />
          <div
            className="playlist-cover__image playlist-cover__image--top-right"
            style={{ backgroundImage: `url('${paddedImages[1]}')` }}
          />
          <div
            className="playlist-cover__image playlist-cover__image--bottom-left"
            style={{ backgroundImage: `url('${paddedImages[2]}')` }}
          />
          <div
            className="playlist-cover__image playlist-cover__image--bottom-right"
            style={{ backgroundImage: `url('${paddedImages[3]}')` }}
          />
        </div>
        <HoverOverlay
          showPlayButton={true}
          onPlayPause={e => {
            e.stopPropagation();
            handlePlayPlaylist();
          }}
          actions={[
            {
              icon: "ellipsis",
              onClick: e => e.stopPropagation(),
              title: "More options",
              customComponent: (
                <DropdownMenu
                  trigger={
                    <button
                      className="hover-overlay-btn"
                      onClick={e => e.stopPropagation()}
                      title="More options"
                    >
                      <MuzaIcon iconName="ellipsis" />
                    </button>
                  }
                  items={dropdownMenuItems}
                />
              ),
            },
          ]}
        />
      </div>
      <div className="playlist-cover__info">
        <div className="playlist-cover__title">{title}</div>
        <div className="playlist-cover__details">
          <span className="playlist-cover__songs-count">
            {songsCount} Songs
          </span>
          <span className="playlist-cover__separator">•</span>
          <span className="playlist-cover__user-name">{userName}</span>
        </div>
      </div>
    </div>
  );
};

export default PlaylistCover;
