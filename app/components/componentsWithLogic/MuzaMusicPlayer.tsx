import { useCallback, useMemo } from 'react'

import { useCurrentPlayerStore } from '~/store/currentPlayerStore'
import { useMedia } from '~/store/media/mediaContext'
import type { PlayerDetails, SongDetails } from '~/store/models'

import { MusicPlayer } from '../sections/MusicPlayer'

export default function MuzaMusicPlayer() {
  const library = useMedia()
  const songs = library.songs
  const {
    selectedSong,
    setSelectedSong,
    isPlaying,
    setIsPlaying,
    playCountIncremented,
    setPlayCountIncremented,
  } = useCurrentPlayerStore()

  const getCurrentSongIndex = () => {
    if (!selectedSong || !selectedSong.id) return -1
    return songs.findIndex((song: SongDetails) => song.id === selectedSong.id)
  }

  const handlePreviousSong = () => {
    const currentIndex = getCurrentSongIndex()
    let prevSong
    if (currentIndex <= 0) {
      prevSong = songs[songs.length - 1]
    } else {
      prevSong = songs[currentIndex - 1]
    }
    setSelectedSong({
      ...prevSong,
    })
  }

  const handleNextSong = () => {
    const currentIndex = getCurrentSongIndex()
    let nextSong
    if (currentIndex === -1 || currentIndex === songs.length - 1) {
      nextSong = songs[0]
    } else {
      nextSong = songs[currentIndex + 1]
    }
    setSelectedSong({
      ...nextSong,
    })
  }

  const handlePlayCountIncrement = () => {
    if (selectedSong?.id && !playCountIncremented) {
      // TODO: Submit to server action to increment play count
      setPlayCountIncremented(true)
    }
  }
  const details = useMemo(() => {
    return {
      audioUrl: selectedSong?.audioUrl || '',
      imageSrc: selectedSong?.imageSrc || '',
      title: selectedSong?.title,
      artist: selectedSong?.artist || '',
      album: selectedSong?.album || '',
      year: selectedSong?.year || new Date().getFullYear(),
      isPlaying: isPlaying || false,
      id: selectedSong?.id,
    }
  }, [selectedSong, isPlaying])

  const onUpdate = useCallback(
    (updatedDetails: PlayerDetails) => {
      setSelectedSong({
        ...selectedSong!,
        audioUrl: updatedDetails.audioUrl!,
      })
    },
    [selectedSong, setSelectedSong]
  )
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
  )
}
