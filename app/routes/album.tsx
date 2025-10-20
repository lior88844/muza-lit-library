import { useMemo, useState } from "react";
import type { SongDetails } from "~/appData/models";
import { useMusicLibraryStore } from "~/appData/musicStore";
import { useCurrentPlayerStore } from "~/appData/currentPlayerStore";
import MediaHeader from "~/components/MediaHeader";
import SongLine from "~/components/songLineDisplays/SongLine";
import { useLoaderData } from "react-router";

import "../styles/scrollbar.scss";
import "../styles/variables.scss";
import "../styles/main.scss";
import { fetchAlbumById } from "../../server";
import AlbumInfoModal from "../components/albumDisplays/AlbumInfoModal";

export async function loader({ params }: { params: { id: string } }) {
  const albumId = parseInt(params.id, 10);

  if (isNaN(albumId)) {
    throw new Error("Invalid album ID");
  }

  try {
    const albumData = await fetchAlbumById(albumId);

    if (!albumData) {
      throw new Error("Album not found");
    }

    return { album: albumData };
  } catch {
    throw new Error("Failed to load album");
  }
}

export default function AlbumPage() {
  const {
    selectedSong,
    setSelectedSong,
    setIsPlaying,
    isPlaying,
    togglePlayPause,
  } = useCurrentPlayerStore();
  const { recentlyPlayed } = useMusicLibraryStore();
  const [isModalOpen, setModalOpen] = useState(false);
  const { album } = useLoaderData<typeof loader>();

  const albumSongs = useMemo(
    () =>
      album.tracks
        ?.map(track =>
          recentlyPlayed.find((s: SongDetails) => s.id === track.id)
        )
        .filter(v => v !== undefined) || [],
    [album.tracks, recentlyPlayed]
  );

  return (
    <main>
      <MediaHeader
        title={album.title}
        imageSrc={album.coverArt || ""}
        creator={album.artist.name}
        mediaMetadata={{
          year: album.releaseDate?.getFullYear(),
          songCount: album.tracks?.length,
        }}
        onInfoClick={() => setModalOpen(true)}
        songs={albumSongs}
        mediaType="album"
        showBackButton={true}
      />
      <div className="album-song-list">
        {album.tracks.map(track => {
          return (
            <SongLine
              key={track.id}
              details={track}
              onClick={() => {
                if (selectedSong?.id === track.id) {
                  togglePlayPause();
                } else {
                  setSelectedSong(track);
                  setIsPlaying(true);
                }
              }}
              isPlaying={track.id === selectedSong?.id && !!isPlaying}
            />
          );
        })}
      </div>
      <AlbumInfoModal
        album={album}
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
      />
    </main>
  );
}
