import type { PlayerDetails, SongDetails } from "~/appData/models";
import { useMusicLibraryStore } from "~/appData/musicStore";
import { useCurrentPlayerStore } from "~/appData/currentPlayerStore";
import { MusicPlayer } from "../sections/MusicPlayer";
import { useCallback, useMemo } from "react";

export default function MuzaMusicPlayer() {
  const { recentlyPlayed, incrementPlayCount } = useMusicLibraryStore();
  const {
    selectedSong,
    setSelectedSong,
    isPlaying,
    setIsPlaying,
    playCountIncremented,
    setPlayCountIncremented,
  } = useCurrentPlayerStore();

  const getCurrentSongIndex = () => {
    if (!selectedSong || !selectedSong.id) return -1;
    return recentlyPlayed.findIndex(
      (song: SongDetails) => song.id === selectedSong.id
    );
  };

  const handlePreviousSong = () => {
    const currentIndex = getCurrentSongIndex();
    let prevSong;
    if (currentIndex <= 0) {
      prevSong = recentlyPlayed[recentlyPlayed.length - 1];
    } else {
      prevSong = recentlyPlayed[currentIndex - 1];
    }
    setSelectedSong({
      ...prevSong,
    });
  };

  const handleNextSong = () => {
    const currentIndex = getCurrentSongIndex();
    let nextSong;
    if (currentIndex === -1 || currentIndex === recentlyPlayed.length - 1) {
      nextSong = recentlyPlayed[0];
    } else {
      nextSong = recentlyPlayed[currentIndex + 1];
    }
    setSelectedSong({
      ...nextSong,
    });
  };

  const handlePlayCountIncrement = () => {
    if (selectedSong?.id && !playCountIncremented) {
      incrementPlayCount(selectedSong.id);
      setPlayCountIncremented(true);
    }
  };
  const details = useMemo(() => {
    return {
      audioUrl: selectedSong?.audioUrl || "",
      imageSrc: selectedSong?.imageSrc || "",
      title: selectedSong?.title,
      artist: selectedSong?.artist || "",
      album: selectedSong?.album || "",
      year: selectedSong?.year || new Date().getFullYear(),
      isPlaying: isPlaying || false,
      id: selectedSong?.id,
    };
  }, [selectedSong, isPlaying]);

  const onUpdate = useCallback(
    (updatedDetails: PlayerDetails) => {
      setSelectedSong({
        ...selectedSong!,
        audioUrl: updatedDetails.audioUrl!,
      });
    },
    [selectedSong, setSelectedSong]
  );
  return (
    <>
      {selectedSong && (
        <MusicPlayer
          details={details}
          setIsPlaying={setIsPlaying}
          onUpdate={onUpdate}
          onPrevious={handlePreviousSong}
          onNext={handleNextSong}
          onSongEnded={handleNextSong}
          onPlayCountIncrement={handlePlayCountIncrement}
        />
      )}
    </>
  );
}
