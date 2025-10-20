import React from "react";
import type { UploadFormData, TrackMetadata } from "~/appData/uploadStore";
import type { Album, SongDetails } from "~/appData/models";
import MediaHeader from "~/components/MediaHeader";
import SongLine from "~/components/songLineDisplays/SongLine";
import { useCurrentPlayerStore } from "~/appData/currentPlayerStore";
import "./UploadStepThree.scss";

interface UploadStepThreeProps {
  formData: UploadFormData;
  trackMetadata: TrackMetadata[];
  coverImage: File | null;
  onSave?: () => void;
  onPublish?: () => void;
}

const UploadStepThree: React.FC<UploadStepThreeProps> = ({
  formData,
  trackMetadata,
  coverImage,
  onSave,
  onPublish,
}) => {
  const {
    selectedSong,
    setSelectedSong,
    setIsPlaying,
    isPlaying,
    togglePlayPause,
  } = useCurrentPlayerStore();

  const getCoverImageUrl = () => {
    if (coverImage) {
      return URL.createObjectURL(coverImage);
    }
    return "/art/muza.png"; // Fallback image
  };

  // Transform upload data into Album format
  const transformToAlbum = (): Album => {
    return {
      id: Date.now(),
      imageSrc: getCoverImageUrl(),
      title: formData.albumTitle || "Untitled Album",
      releaseDate: new Date(formData.recordingDate),
      artist: formData.mainArtist || "Unknown Artist",
      songs: trackMetadata.map((_, index) => index + 1),
    };
  };

  // Transform track metadata into SongDetails format
  const transformToSongDetails = (): SongDetails[] => {
    return trackMetadata.map((track, index) => {
      // Parse duration string to seconds
      const parseDuration = (durationStr: string): number => {
        if (!durationStr || durationStr === "0:00") return 0;
        const parts = durationStr.split(":");
        if (parts.length === 2) {
          const minutes = parseInt(parts[0]) || 0;
          const seconds = parseInt(parts[1]) || 0;
          return minutes * 60 + seconds;
        }
        return 0;
      };

      return {
        id: Date.now(),
        index: index + 1,
        title: track.songName || "Untitled",
        artist: track.composer || formData.mainArtist || "Unknown Artist",
        album: formData.albumTitle || "Untitled Album",
        time: parseDuration(track.duration),
        year: new Date().getFullYear(),
        imageSrc: getCoverImageUrl(),
        audioUrl: track.file ? URL.createObjectURL(track.file) : undefined,
      };
    });
  };

  const album = transformToAlbum();
  const songDetails = transformToSongDetails();

  return (
    <div className="upload-step-three">
      <div className="album-preview">
        <MediaHeader
          songs={songDetails}
          mediaType="album"
          title={album.title}
          imageSrc={album.imageSrc || ""}
          mediaMetadata={{
            songCount: songDetails.length,
            year: album.releaseDate?.getFullYear(),
          }}
          creator={album.artist}
          showBackButton={false}
          customActions={<div></div>}
        />
        <hr />

        <div className="album-song-list">
          {songDetails.map((song: SongDetails) => (
            <SongLine
              key={song.id}
              details={song}
              onClick={() => {
                if (selectedSong?.id === song.id) {
                  togglePlayPause();
                } else {
                  setSelectedSong(song);
                  setIsPlaying(true);
                }
              }}
              isPlaying={song.id === selectedSong?.id && !!isPlaying}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default UploadStepThree;
