import './MusicPlayer.scss'

import Hls from 'hls.js'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { FaSpinner } from 'react-icons/fa'

import MuzaIcon from '~/icons/MuzaIcon'
import { useTranslation } from '~/lib/i18n/translations'
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
    if (isLoading) return
    const newPlayingState = !details.isPlaying
    setIsPlaying(newPlayingState)
    if (newPlayingState) {
      onPlayCountIncrement?.()
    }
    onUpdate?.({ ...details })
  }

  // Effects
  // useEffect(() => {
  //   setIsPlaying(details.isPlaying || false);
  // }, [details.isPlaying, setIsPlaying]);

  // useEffect(() => {
  //   const audio = playerRef.current;
  //   if (!audio) return;

  //   if (details.isPlaying && !isLoading) {
  //     playAudio();
  //   } else if (!details.isPlaying) {
  //     audio.pause();
  //   }
  // }, [details.isPlaying, isLoading, playAudio]);

  useEffect(() => {
    const audio = playerRef.current
    if (!audio || !details.audioUrl) return

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
  }, [details.audioUrl, details.isPlaying, onPlayCountIncrement, onSongEnded, playAudio, setIsPlaying, volume])

  return (
    <div className='music-player'>
      <video ref={playerRef} hidden />

      <div className='player-info'>
        <img className='album-art' src={details.imageSrc} alt={`${details.title} album cover`} />
        <div className='track-info'>
          <h3 className='track-title'>{details.title}</h3>
          <p className='track-artist'>{details.artist}</p>
          <div className='track-details'>
            <span>{details.album}</span>
            <span className='separator'>•</span>
            <span>{details.year}</span>
          </div>
        </div>
      </div>

      <div className='player-controls'>
        <div className='progress-section'>
          <div className='progress-bar' onClick={handleSeek}>
            <div className='progress-fill' style={{ width: `${progressPercentage}%` }} />
          </div>
          <div className='time-display'>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration - currentTime)}</span>
          </div>
        </div>

        <div className='controls-row'>
          <div className='playback-controls'>
            <button
              className={`control-btn shuffle ${shuffle ? 'active' : ''}`}
              onClick={() => setShuffle(!shuffle)}
              aria-label={t('player.shuffle')}
            >
              <MuzaIcon iconName='shuffle' />
            </button>

            <button className='control-btn previous' onClick={onPrevious} aria-label={t('player.previous')}>
              <MuzaIcon iconName='skip-back' />
            </button>

            <button className='control-btn play' onClick={togglePlayPause} aria-label={t('player.playPause')}>
              {isLoading ? (
                <FaSpinner className='spinner' />
              ) : details.isPlaying ? (
                <MuzaIcon iconName='pause' />
              ) : (
                <MuzaIcon iconName='play' />
              )}
            </button>

            <button className='control-btn next' onClick={onNext} aria-label={t('player.next')}>
              <MuzaIcon iconName='skip-forward' />
            </button>

            <button
              className={`control-btn repeat ${repeat ? 'active' : ''}`}
              onClick={() => setRepeat(!repeat)}
              aria-label={t('player.repeat')}
            >
              <MuzaIcon iconName='repeat' />
            </button>
          </div>

          <div className='volume-section'>
            <VolumeControl noSymbol={true} value={volume} onVolumeChange={handleVolumeChange} />
          </div>
        </div>
      </div>
    </div>
  )
}
