import Hls from 'hls.js'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaSpinner } from 'react-icons/fa'

import MuzaIcon from '~/icons/MuzaIcon'
import { cn } from '~/lib/utils'
import type { PlayerDetails } from '~/store/models'

import VolumeControl from '../../controls/VolumeControl'

type MusicPlayerProps = {
  details: PlayerDetails
  onPrevious?: () => void
  onNext?: () => void
  onUpdate?: (details: PlayerDetails) => void
  onSongEnded?: () => void
  setIsPlaying: (b: boolean) => void
  onPlayCountIncrement?: () => void
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  details,
  onPrevious,
  onNext,
  onUpdate,
  onSongEnded,
  setIsPlaying,
  onPlayCountIncrement,
}) => {
  const { t } = useTranslation()
  const playerRef = useRef<HTMLVideoElement | null>(null)
  const hlsRef = useRef<Hls | null>(null)

  // Audio state
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(75)
  const [isLoading, setIsLoading] = useState(false)

  // Control state
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState(false)
  const isFirstLoad = useRef(true)

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

  const isHlsUrl = (url: string): boolean => {
    return url.includes('.m3u8') || url.includes('hls')
  }

  const initializeHls = (url: string) => {
    const audio = playerRef.current
    if (!audio) return

    // Clean up existing HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: false,
      })

      hlsRef.current = hls
      if (audio != null) {
        hls.attachMedia(audio)
      }
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        hls.loadSource(url)
        // hls.on(Hls.Events.MANIFEST_PARSED, () => {
        //   audio
        //     ?.play()
        //     .catch(() =>
        //       console.log(
        //         "Unable to autoplay prior to user interaction with the dom."
        //       )
        //     );
        // });
      })

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              // Fatal network error encountered, try to recover
              hls.startLoad()
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              // Fatal media error encountered, try to recover
              hls.recoverMediaError()
              break
            default:
              // Fatal error, cannot recover
              hls.destroy()
              break
          }
        }
      })
    } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      audio.src = url
    } else {
      // HLS is not supported in this browser
    }
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  // Audio control functions
  const playAudio = useCallback(() => {
    const audio = playerRef.current
    if (!audio) return

    audio.play().catch(() => {
      setIsPlaying(false)
      onUpdate?.({ ...details })
    })
  }, [details, onUpdate, setIsPlaying])

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    if (playerRef.current) {
      playerRef.current.volume = newVolume / 100
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = playerRef.current
    if (!audio || duration === 0) return

    const rect = e.currentTarget.getBoundingClientRect()
    const percentage = (e.clientX - rect.left) / rect.width
    const newTime = percentage * duration

    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const togglePlayPause = () => {
    isFirstLoad.current = false
    if (isLoading) return
    const newPlayingState = !details.isPlaying
    setIsPlaying(newPlayingState)
    if (newPlayingState) {
      onPlayCountIncrement?.()
    }
    onUpdate?.({ ...details })
  }

  useEffect(() => {
    const audio = playerRef.current
    if (!audio || !details.audioUrl || isFirstLoad.current) return

    // Audio event handlers
    const handleLoadedData = () => {
      setDuration(audio.duration)
      setIsLoading(false)
      if (details.isPlaying) playAudio()
    }

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)

    const handleEnded = () => {
      setIsPlaying(false)
      onSongEnded?.()
    }

    // const handlePlay = () => {
    //   setIsPlaying(true);
    //   // Trigger play count increment when audio actually starts playing
    //   onPlayCountIncrement?.();
    // };

    const handlePause = () => {
      setIsPlaying(false)
    }

    const handleLoadStart = () => setIsLoading(true)
    const handleCanPlay = () => setIsLoading(false)

    // Add event listeners
    audio.addEventListener('loadeddata', handleLoadedData)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    // audio.addEventListener("play", handlePlay);
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('loadstart', handleLoadStart)
    audio.addEventListener('waiting', handleLoadStart)
    audio.addEventListener('canplay', handleCanPlay)

    // Setup audio - check if it's HLS or regular audio
    if (isHlsUrl(details.audioUrl)) {
      initializeHls(details.audioUrl)
    } else {
      // Regular audio file
      audio.src = details.audioUrl
      audio.load()
    }

    audio.volume = volume / 100

    // Cleanup
    return () => {
      audio.pause()
      // Clean up HLS instance
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
      audio.removeEventListener('loadeddata', handleLoadedData)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      // audio.removeEventListener("play", handlePlay);
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('loadstart', handleLoadStart)
      audio.removeEventListener('waiting', handleLoadStart)
      audio.removeEventListener('canplay', handleCanPlay)
    }
  }, [
    details.audioUrl,
    details.isPlaying,
    onPlayCountIncrement,
    onSongEnded,
    playAudio,
    setIsPlaying,
    volume,
  ])

  return (
    <div className="fixed bottom-6 left-[calc(var(--muza-sidebar-width,208px)+24px)] right-6 z-[1000] flex overflow-hidden rounded-lg border border-(--muza-light-border-color) bg-white/50 shadow-[0_4px_12px_rgba(0,0,0,0.15)] backdrop-blur-[10px] max-md:flex-col">
      <video ref={playerRef} hidden />

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
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration - currentTime)}</span>
          </div>
        </div>

        <div className="relative flex items-center px-16 py-1 max-sm:px-3">
          <div className="flex flex-1 items-center justify-center gap-4 md:gap-6">
            <button
              className={cn(
                'flex cursor-pointer items-center justify-center border-none bg-transparent p-2 text-[length:var(--muza-subtitle-font-size)] text-(--colors_muted_foreground_light) transition-all duration-200 ease-in-out hover:scale-105 hover:text-gray-700 active:scale-95 max-sm:hidden',
                shuffle && 'text-blue-500',
              )}
              onClick={() => setShuffle(!shuffle)}
              aria-label={t('player.shuffle')}
            >
              <MuzaIcon iconName='shuffle' />
            </button>

            <button
              className="flex cursor-pointer items-center justify-center border-none bg-transparent p-3 text-xl text-(--colors_muted_foreground_light) transition-all duration-200 ease-in-out hover:scale-105 hover:text-gray-700 active:scale-95"
              onClick={onPrevious}
              aria-label={t('player.previous')}
            >
              <MuzaIcon iconName='skip-back' />
            </button>

            <button
              className="flex h-12 w-12 cursor-pointer items-center justify-center border-none bg-transparent text-2xl text-(--muza-play-button-color) transition-all duration-200 ease-in-out hover:scale-105 hover:text-gray-700 active:scale-95"
              onClick={togglePlayPause}
              aria-label={t('player.playPause')}
            >
              {isLoading ? (
                <FaSpinner className="animate-spin" />
              ) : details.isPlaying ? (
                <MuzaIcon iconName='pause' />
              ) : (
                <MuzaIcon iconName='play' />
              )}
            </button>

            <button
              className="flex cursor-pointer items-center justify-center border-none bg-transparent p-3 text-xl text-(--colors_muted_foreground_light) transition-all duration-200 ease-in-out hover:scale-105 hover:text-gray-700 active:scale-95"
              onClick={onNext}
              aria-label={t('player.next')}
            >
              <MuzaIcon iconName='skip-forward' />
            </button>

            <button
              className={cn(
                'flex cursor-pointer items-center justify-center border-none bg-transparent p-2 text-[length:var(--muza-subtitle-font-size)] text-(--colors_muted_foreground_light) transition-all duration-200 ease-in-out hover:scale-105 hover:text-gray-700 active:scale-95 max-sm:hidden',
                repeat && 'text-blue-500',
              )}
              onClick={() => setRepeat(!repeat)}
              aria-label={t('player.repeat')}
            >
              <MuzaIcon iconName='repeat' />
            </button>
          </div>

          <div className="flex items-center pr-8">
            <VolumeControl noSymbol={true} value={volume} onVolumeChange={handleVolumeChange} />
          </div>
        </div>
      </div>
    </div>
  )
}
