import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import MuzaIcon from '~/icons/MuzaIcon'
import { cn } from '~/lib/utils'
import type { PlayerDetails } from '~/store/models'
import { usePlayerStore } from '~/store/playerStore'
import type { RepeatMode } from '~/types/player'

import VolumeControl from '../../controls/VolumeControl'

type MusicPlayerProps = {
  details: PlayerDetails
  seekTo: (seconds: number) => void
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ details, seekTo }) => {
  const { t } = useTranslation()

  // Get store actions and state (use selective subscriptions to avoid unnecessary re-renders)
  const prev = usePlayerStore(state => state.prev)
  const next = usePlayerStore(state => state.next)
  const playPause = usePlayerStore(state => state.playPause)
  const shuffle = usePlayerStore(state => state.shuffle)
  const repeat = usePlayerStore(state => state.repeat)
  const toggleShuffle = usePlayerStore(state => state.toggleShuffle)
  const setRepeat = usePlayerStore(state => state.setRepeat)
  const volume = usePlayerStore(state => state.volume)
  const setVolume = usePlayerStore(state => state.setVolume)
  const currentPosition = usePlayerStore(state => state.currentPosition)
  const duration = usePlayerStore(state => state.duration)

  // Local UI state
  const [isLoading] = useState(false)

  // Helper functions
  const formatTime = (seconds: number): string => {
    // Handle edge cases
    if (!seconds || isNaN(seconds) || !isFinite(seconds)) {
      return '0:00'
    }

    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
      .toString()
      .padStart(2, '0')
    return `${minutes}:${secs}`
  }

  const progressPercentage = duration > 0 ? (currentPosition / duration) * 100 : 0

  // UI event handlers
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume / 100) // Convert from 0-100 to 0-1
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (duration === 0) return

    const rect = e.currentTarget.getBoundingClientRect()
    const percentage = (e.clientX - rect.left) / rect.width
    const newTime = percentage * duration

    seekTo(newTime)
  }

  const togglePlayPause = () => {
    if (isLoading) return
    playPause()
  }

  const cycleRepeat = () => {
    const modes: RepeatMode[] = ['off', 'one', 'all']
    const currentIndex = modes.indexOf(repeat)
    const nextMode = modes[(currentIndex + 1) % modes.length]
    setRepeat(nextMode)
  }

  return (
    <div className="fixed bottom-6 left-[calc(var(--muza-sidebar-width,208px)+24px)] right-6 z-[1000] flex overflow-hidden rounded-lg border border-(--muza-light-border-color) bg-white/50 shadow-[0_4px_12px_rgba(0,0,0,0.15)] backdrop-blur-[10px] max-md:flex-col">

      <div className="flex min-w-[280px] items-start gap-3 border-r border-(--muza-light-border-color) bg-(--colors_muted_light) p-2 max-md:min-w-0 max-md:border-r-0 max-md:border-t">
        <img
          className="h-16 w-16 flex-shrink-0 rounded-md object-cover"
          src={details.imageSrc || '/art/imag_1.jpg'}
          alt={`${details.title} album cover`}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h3 className="overflow-hidden text-ellipsis whitespace-nowrap font-[family-name:var(--typography-font-family-font-sans)] text-[length:var(--muza-subtitle-font-size)] font-semibold leading-normal text-(--muza-track-title-color)">
            {details.title}
          </h3>
          <p className="overflow-hidden text-ellipsis whitespace-nowrap font-[family-name:var(--typography-font-family-font-sans)] text-sm font-normal leading-[100%] text-(--colors_muted_foreground_light)">
            {details.artist}
          </p>
          <div className="flex gap-1 text-xs text-(--colors_muted_foreground_light) max-sm:hidden">
            <span>{details.album}</span>
            <span className="text-gray-300">•</span>
            <span>{details.year}</span>
          </div>
        </div>
      </div>

      <div className="flex min-w-[400px] flex-1 flex-col gap-2 max-md:min-w-0">
        <div className="relative p-0">
          <div className="relative h-2 cursor-pointer bg-gray-100" onClick={handleSeek}>
            <div
              className="h-full bg-blue-500 transition-[width] duration-100 ease-linear"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="absolute left-0 right-0 top-full flex justify-between px-4 pt-2 text-xs text-(--colors_muted_foreground_light)">
            <span>{formatTime(currentPosition)}</span>
            <span>{formatTime(duration - currentPosition)}</span>
          </div>
        </div>

        <div className="relative flex items-center px-16 py-1 max-sm:px-3">
          <div className="flex flex-1 items-center justify-center gap-4 md:gap-6">
            <button
              className={cn(
                'flex cursor-pointer items-center justify-center border-none bg-transparent p-2 text-[length:var(--muza-subtitle-font-size)] text-(--colors_muted_foreground_light) transition-all duration-200 ease-in-out hover:scale-105 hover:text-gray-700 active:scale-95 max-sm:hidden',
                shuffle && 'text-blue-500',
              )}
              onClick={toggleShuffle}
              aria-label={t('player.shuffle')}
            >
              <MuzaIcon iconName='shuffle' />
            </button>

            <button
              className="flex cursor-pointer items-center justify-center border-none bg-transparent p-3 text-xl text-(--colors_muted_foreground_light) transition-all duration-200 ease-in-out hover:scale-105 hover:text-gray-700 active:scale-95"
              onClick={prev}
              aria-label={t('player.previous')}
            >
              <MuzaIcon iconName='skip-back' />
            </button>

            <button
              className="flex h-12 w-12 cursor-pointer items-center justify-center border-none bg-transparent text-2xl text-(--muza-play-button-color) transition-all duration-200 ease-in-out hover:scale-105 hover:text-gray-700 active:scale-95"
              onClick={togglePlayPause}
              aria-label={t('player.playPause')}
            >
              {details.isPlaying ? (
                <MuzaIcon iconName='pause' />
              ) : (
                <MuzaIcon iconName='play' />
              )}
            </button>

            <button
              className="flex cursor-pointer items-center justify-center border-none bg-transparent p-3 text-xl text-(--colors_muted_foreground_light) transition-all duration-200 ease-in-out hover:scale-105 hover:text-gray-700 active:scale-95"
              onClick={next}
              aria-label={t('player.next')}
            >
              <MuzaIcon iconName='skip-forward' />
            </button>

            <button
              className={cn(
                'flex cursor-pointer items-center justify-center border-none bg-transparent p-2 text-[length:var(--muza-subtitle-font-size)] text-(--colors_muted_foreground_light) transition-all duration-200 ease-in-out hover:scale-105 hover:text-gray-700 active:scale-95 max-sm:hidden',
                repeat !== 'off' && 'text-blue-500',
              )}
              onClick={cycleRepeat}
              aria-label={t('player.repeat')}
            >
              <MuzaIcon iconName='repeat'/>
            </button>
          </div>

          <div className="flex items-center pr-8">
            <VolumeControl noSymbol={true} value={volume * 100} onVolumeChange={handleVolumeChange} />
          </div>
        </div>
      </div>
    </div>
  )
}
