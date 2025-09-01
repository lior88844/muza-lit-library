import React from "react";
import { useLocation, useNavigate } from "react-router";
import PlaylistDetail from "~/components/playlistDisplays/PlaylistDetail";
import { useTranslation } from "~/lib/i18n/translations";
import type { MusicPlaylist } from "~/appData/models";

import "../styles/scrollbar.scss";
import "../styles/variables.scss";
import "../styles/main.scss";

interface PlaylistPageState {
  playlist: MusicPlaylist;
}

export default function PlaylistPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  // Get playlist from navigation state, similar to album page
  const { playlist }: PlaylistPageState = location.state || {};

  if (!playlist) {
    return (
      <main>
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <h1>{t("error.playlistNotFound") || "Playlist not found"}</h1>
          <button onClick={() => navigate("/playlists")}>
            {t("common.backToPlaylists") || "Back to Playlists"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main>
      <PlaylistDetail playlist={playlist} />
    </main>
  );
}
