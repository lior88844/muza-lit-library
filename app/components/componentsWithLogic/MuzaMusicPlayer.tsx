import { useEffect, useMemo } from 'react'

import { usePlaybackEngine } from '~/hooks/usePlaybackEngine'
import { rehydratePlayerStore, usePlayerStore } from '~/store/playerStore'

import { MusicPlayer } from '../sections/MusicPlayer'

export default function MuzaMusicPlayer() {
  const { seekTo } = usePlaybackEngine()

  const current = usePlayerStore(state => state.current)
  const isPlaying = usePlayerStore(state => state.isPlaying)

  useEffect(() => {
    rehydratePlayerStore()
  }, [])

  const details = useMemo(() => {
    return {
      audioUrl: current?.audioUrl || '',
      imageSrc: current?.imageSrc || '',
      title: current?.title,
      artist: current?.artist || '',
      album: current?.album || '',
      year: current?.year || new Date().getFullYear(),
      isPlaying: isPlaying || false,
      id: current?.id,
    }
  }, [current, isPlaying])

  if (!current) return null

  return <MusicPlayer details={details} seekTo={seekTo} />
}
