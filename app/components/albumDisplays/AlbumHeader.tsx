import React, { useEffect, useState } from "react";
import "./AlbumHeader.css";
import type { Album, SongDetails } from "~/appData/models";
import { FaPause, FaPlay } from "react-icons/fa";
import { useUserStore } from "~/appData/userStore";
import { toast } from "react-toastify";
import AlbumInfoModal from "./AlbumInfoModal";
import MuzaIcon from "~/icons/MuzaIcon";

interface AlbumHeaderProps {
  album: Album;
  songs: SongDetails[];
}

const AlbumHeader: React.FC<AlbumHeaderProps> = ({ album, songs }) => {
  const { selectedSong, setSelectedSong, setSelectedPlaListOrAlbum } =
    useUserStore();
  const [isModalOpen, setModalOpen] = useState(false);

  const GetRandomSong = () => {
    return Math.floor(Math.random() * songs.length);
  };

  const addToLibrary = () => {
    toast("Album added succssefuly to your library", {
      position: "bottom-center",
      hideProgressBar: true,
    });
  };

  const Play = () => {
    setSelectedSong(songs[0]);
    setSelectedPlaListOrAlbum(album);
  };

  return (
    <div className="album-header-card">
      <div className="image-container">
        <img src={album.imageSrc} />
      </div>
      <div className="info">
        <div className="title">{album.title}</div>
        <div className="artist">{album.artist}</div>
        <div className="atrist">Album • {album.songs?.length} Songs</div>
        <button className="icon-button" onClick={() => Play()}>
          {selectedSong?.isPlaying ? <FaPause /> : <FaPlay />}
        </button>
        <button
          className="icon-button"
          onClick={() => setSelectedSong(songs[GetRandomSong()])}
        >
          <span className="icon icon-shuffle">
            <MuzaIcon iconName="shuffle" />
          </span>
        </button>
        <button className="icon-button" onClick={addToLibrary}>
          <span className="icon icon-plus" />
        </button>
        <button className="icon-button" onClick={() => setModalOpen(true)}>
          <span className="icon icon-info" />
        </button>
      </div>
      <AlbumInfoModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
      ></AlbumInfoModal>
    </div>
  );
};

export default AlbumHeader;
