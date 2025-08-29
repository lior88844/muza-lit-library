import { useEffect, useState } from "react";
import AlbumDetails from "~/components/albumDisplays/AlbumDetails";
import type { Album } from "~/appData/models";
import { useCurrentPlayerStore } from "~/appData/currentPlayerStore";
import { useMusicLibraryStore } from "~/appData/musicStore";
import { useTranslation } from "~/lib/i18n/translations";

import "../styles/scrollbar.scss";
import "../styles/variables.scss";
import "../styles/main.scss";
import "./albums.scss";

export default function Albums() {
  const { t } = useTranslation();
  const setSelectedSong = useCurrentPlayerStore(
    (state) => state.setSelectedSong,
  );
  const { newReleases, recentlyPlayed } = useMusicLibraryStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleAlbumClick = (album: Album) => {
    if (album.songs && album.songs.length > 0) {
      const songIndex = album.songs[0] - 1;
      if (songIndex >= 0 && songIndex < recentlyPlayed.length) {
        setSelectedSong(recentlyPlayed[songIndex]);
      }
    }
  };

  if (loading) return <p>{t("general.loading")}</p>;
  if (error)
    return <p>{t("general.errorWithMessage").replace("{error}", error)}</p>;

  return (
    <main className="albums-page">
      <div className="page-header">
        <h1>{t("page.albums")}</h1>
      </div>

      <div className="albums-grid">
        {newReleases.map((album) => (
          <AlbumDetails
            key={album.id}
            details={album}
            onAlbumClick={() => handleAlbumClick(album)}
          />
        ))}
      </div>
    </main>
  );
}
