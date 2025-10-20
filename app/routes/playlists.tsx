import { useNavigate } from "react-router";
import { useMusicLibraryStore } from "~/appData/musicStore";
import { useCurrentPlayerStore } from "~/appData/currentPlayerStore";
import PlaylistGrid from "~/components/listsDisplays/PlaylistGrid";
import CreatePlaylistModal from "~/components/ui/CreatePlaylistModal";
import { useState } from "react";
import { useTranslation } from "~/lib/i18n/translations";

import "../styles/scrollbar.scss";
import "../styles/variables.scss";
import "../styles/main.scss";

export default function Playlists() {
  const { t } = useTranslation();
  const { playlists, createPlaylist } = useMusicLibraryStore();
  const { openPlaylistDrawer } = useCurrentPlayerStore();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePlaylistClick = (playlist: any) => {
    // Navigate to individual playlist detail page using state like albums
    navigate("/playlist", { state: { playlist } });
  };

  const handleCreatePlaylist = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleCreatePlaylistSubmit = (name: string, visibility: string) => {
    // Create the new playlist
    const newPlaylist = {
      id: Date.now().toString(), // Simple ID generation
      title: name,
      name,
      visibility,
      songs: [],
      suggestions: [],
      imageSrc: "", // Will be set when songs are added
      createdAt: new Date().toISOString(),
    };

    // Add to store if the function exists
    if (createPlaylist) {
      createPlaylist(newPlaylist);
    }

    setIsModalOpen(false);

    // Open the playlist drawer with the newly created playlist
    openPlaylistDrawer(newPlaylist.id);
  };

  return (
    <main>
      <h1>{t("page.playlists")}</h1>
      <hr />

      <PlaylistGrid
        playlists={playlists}
        onPlaylistClick={handlePlaylistClick}
        onCreatePlaylist={handleCreatePlaylist}
      />

      <CreatePlaylistModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onCreatePlaylist={handleCreatePlaylistSubmit}
      />
    </main>
  );
}
