import React, { useState } from "react";
import "./UploadStepThree.scss";
import type { SongDetails } from "~/appData/models";
import { useCurrentPlayerStore } from "~/appData/currentPlayerStore";
import { useMusicLibraryStore } from "~/appData/musicStore";
import MuzaButton from "~/controls/MuzaButton";
import { useNavigate } from "react-router";
import { useTranslation } from "~/lib/i18n/translations";

interface UploadStepThreeProps {
  trackMetadata: SongDetails[];
  onBack: () => void;
  onComplete: () => void;
}

const UploadStepThree: React.FC<UploadStepThreeProps> = ({
  trackMetadata,
  onBack,
  onComplete,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const selectedSong = useCurrentPlayerStore((state) => state.selectedSong);
  const setSelectedSong = useCurrentPlayerStore(
    (state) => state.setSelectedSong,
  );
  const setIsPlaying = useCurrentPlayerStore((state) => state.setIsPlaying);
  const isPlaying = useCurrentPlayerStore((state) => state.isPlaying);
  const togglePlayPause = useCurrentPlayerStore(
    (state) => state.togglePlayPause,
  );
  const { createPlaylist } = useMusicLibraryStore();

  const [playlistName, setPlaylistName] = useState("");
  const [playlistVisibility, setPlaylistVisibility] = useState("public");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreatePlaylist = async () => {
    if (!playlistName.trim()) return;

    setIsCreating(true);
    try {
      const newPlaylist = {
        id: Date.now().toString(),
        title: playlistName,
        name: playlistName,
        visibility: playlistVisibility,
        songs: trackMetadata,
        suggestions: [],
        imageSrc: trackMetadata[0]?.imageSrc || "",
        createdAt: new Date().toISOString(),
      };

      createPlaylist(newPlaylist);
      onComplete();
    } catch (error) {
      console.error("Error creating playlist:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handlePlayAll = () => {
    if (trackMetadata.length > 0) {
      setSelectedSong(trackMetadata[0]);
      setIsPlaying(true);
    }
  };

  const handleSongClick = (song: SongDetails) => {
    if (selectedSong?.id === song.id) {
      togglePlayPause();
    } else {
      setSelectedSong(song);
      setIsPlaying(true);
    }
  };

  return (
    <div className="upload-step-three">
      <div className="step-header">
        <h2>{t("upload.stepThree.title")}</h2>
        <p>{t("upload.stepThree.description")}</p>
      </div>

      <div className="playlist-creation">
        <div className="form-group">
          <label htmlFor="playlist-name">{t("upload.playlistName")}</label>
          <input
            id="playlist-name"
            type="text"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            placeholder={t("upload.playlistNamePlaceholder")}
            className="playlist-name-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="playlist-visibility">{t("upload.visibility")}</label>
          <select
            id="playlist-visibility"
            value={playlistVisibility}
            onChange={(e) => setPlaylistVisibility(e.target.value)}
            className="visibility-select"
          >
            <option value="public">{t("upload.public")}</option>
            <option value="private">{t("upload.private")}</option>
          </select>
        </div>
      </div>

      <div className="tracks-preview">
        <div className="tracks-header">
          <h3>{t("upload.tracksPreview")}</h3>
          <MuzaButton onClick={handlePlayAll} content={t("upload.playAll")} />
        </div>

        <div className="tracks-list">
          {trackMetadata.map((track, index) => (
            <div
              key={track.id || index}
              className={`track-item ${
                selectedSong?.id === track.id && isPlaying ? "playing" : ""
              }`}
              onClick={() => handleSongClick(track)}
            >
              <div className="track-info">
                <span className="track-number">{index + 1}</span>
                <div className="track-details">
                  <span className="track-title">{track.title}</span>
                  <span className="track-artist">{track.artist}</span>
                </div>
              </div>
              <div className="track-actions">
                <span className="track-duration">
                  {track.time
                    ? `${Math.floor(track.time / 60)}:${String(track.time % 60).padStart(2, "0")}`
                    : "0:00"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="step-actions">
        <MuzaButton onClick={onBack} content={t("action.back")} />
        <MuzaButton
          onClick={handleCreatePlaylist}
          disabled={!playlistName.trim() || isCreating}
          content={
            isCreating ? t("upload.creating") : t("upload.createPlaylist")
          }
        />
      </div>
    </div>
  );
};

export default UploadStepThree;
