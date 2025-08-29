import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import SongLine from "~/components/songLineDisplays/SongLine";
import MediaHeader from "~/components/MediaHeader/MediaHeader";
import type { Album, SongDetails } from "~/appData/models";
import { useCurrentPlayerStore } from "~/appData/currentPlayerStore";
import { useMusicLibraryStore } from "~/appData/musicStore";

import "../styles/scrollbar.scss";
import "../styles/variables.scss";
import "../styles/main.scss";

interface AlbumPageState {
  album: Album;
}

export default function AlbumPage() {
  const selectedSong = useCurrentPlayerStore((state) => state.selectedSong);
  const setSelectedSong = useCurrentPlayerStore(
    (state) => state.setSelectedSong,
  );
  const setIsPlaying = useCurrentPlayerStore((state) => state.setIsPlaying);
  const isPlaying = useCurrentPlayerStore((state) => state.isPlaying);
  const togglePlayPause = useCurrentPlayerStore(
    (state) => state.togglePlayPause,
  );
  const { recentlyPlayed } = useMusicLibraryStore();

  const [albumSongsDetails, setAlbumSongsDetails] = useState<SongDetails[]>([]);
  const location = useLocation();
  const { album }: AlbumPageState = location.state;

  useEffect(() => {
    const allSongsDetails = recentlyPlayed;
    let details: SongDetails[] = [];
    album?.songs?.map((songIndex) =>
      details.push(allSongsDetails[songIndex - 1]),
    );
    setAlbumSongsDetails(details);
  }, [album]);

  return (
    <main>
      <MediaHeader
        media={album}
        songs={albumSongsDetails}
        mediaType="album"
        showBackButton={true}
      />
      <div className="album-song-list">
        {albumSongsDetails.map((s: SongDetails) => (
          <SongLine
            key={s.id}
            details={s}
            onClick={() => {
              if (selectedSong?.id === s.id) {
                togglePlayPause();
              } else {
                setSelectedSong(s);
                setIsPlaying(true);
              }
            }}
            isPlaying={s.id === selectedSong?.id && !!isPlaying}
          />
        ))}
      </div>
    </main>
  );
}
