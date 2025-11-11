/**
 * MuzaMusicPlayer - Main music player wrapper
 * Initializes the playback engine and renders the UI component
 */

import { useEffect, useMemo } from 'react'

import { usePlaybackEngine } from '~/hooks/usePlaybackEngine'
import { rehydratePlayerStore, usePlayerStore } from '~/store/playerStore'

import { MusicPlayer } from '../sections/MusicPlayer'

export default function MuzaMusicPlayer() {
  // Initialize playback engine (manages audio element, HLS, etc.)
  const { seekTo } = usePlaybackEngine()

  // Get player state (use selective subscriptions to avoid unnecessary re-renders)
  const current = usePlayerStore(state => state.current)
  const isPlaying = usePlayerStore(state => state.isPlaying)

  // Rehydrate persisted state on mount (client-side only)
  useEffect(() => {
    rehydratePlayerStore()
  }, [])

  // Prepare player details for UI
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

  // Only render if there's a current track
  if (!current) return null

  return <MusicPlayer details={details} seekTo={seekTo} />
}
