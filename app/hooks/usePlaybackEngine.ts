/**
 * Playback Engine Hook
 * Manages audio element, HLS streaming, and syncs playback state with the player store
 * This is the bridge between the browser's media APIs and our application state
 */

import Hls from 'hls.js'
import { useEffect, useRef } from 'react'

import { usePlayerStore } from '~/store/playerStore'

/**
 * Check if a URL is an HLS stream
 */
function isHlsUrl(url: string): boolean {
  return url.includes('.m3u8') || url.includes('hls')
}

/**
 * Main playback engine hook
 * Call this once at the app level to manage audio playback
 * 
 * @returns seekTo function for manual seeking
 */
export function usePlaybackEngine() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const hlsRef = useRef<Hls | null>(null)
  const playCountTimerRef = useRef<NodeJS.Timeout | null>(null)

  const {
    current,
    isPlaying,
    volume,
    next,
    setCurrentPosition,
    setDuration,
    setIsPlaying,
    startPlayAttempt,
    reportPlay,
  } = usePlayerStore()

  // ========================================
  // 1. INITIALIZE AUDIO ELEMENT (once)
  // ========================================
  useEffect(() => {
    // Create hidden video element (we use video instead of audio for HLS compatibility)
    const video = document.createElement('video')
    video.style.display = 'none'
    video.playsInline = true
    document.body.appendChild(video)
    videoRef.current = video

    return () => {
      // Cleanup on unmount
      video.pause()
      video.src = ''
      document.body.removeChild(video)
      videoRef.current = null
    }
  }, [])

  // ========================================
  // 2. LOAD NEW TRACK WHEN CURRENT CHANGES
  // ========================================
  useEffect(() => {
    const video = videoRef.current
    if (!video || !current?.audioUrl) return

    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    // Clear any pending play count timer
    if (playCountTimerRef.current) {
      clearTimeout(playCountTimerRef.current)
      playCountTimerRef.current = null
    }

    // Determine if we need HLS or native audio
    if (isHlsUrl(current.audioUrl)) {
      // HLS streaming
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: false,
        })

        hlsRef.current = hls
        hls.attachMedia(video)

        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          hls.loadSource(current.audioUrl)
        })

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error('HLS network error, attempting recovery')
                hls.startLoad()
                break
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error('HLS media error, attempting recovery')
                hls.recoverMediaError()
                break
              default:
                console.error('Fatal HLS error, cannot recover')
                hls.destroy()
                // Auto-skip to next track on fatal error
                setTimeout(() => next(), 1000)
                break
            }
          }
        })
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        video.src = current.audioUrl
        video.load()
      } else {
        console.error('HLS not supported in this browser')
      }
    } else {
      // Regular audio file
      video.src = current.audioUrl
      video.load()
    }

    // Start tracking this play attempt
    startPlayAttempt(current.id)

    // Cleanup function
    return () => {
      if (playCountTimerRef.current) {
        clearTimeout(playCountTimerRef.current)
      }
    }
  }, [current?.audioUrl, current?.id, next, startPlayAttempt])

  // ========================================
  // 3. SYNC PLAY/PAUSE STATE
  // ========================================
  useEffect(() => {
    const video = videoRef.current
    if (!video || !current) return

    if (isPlaying) {
      const playPromise = video.play()
      
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error('Playback failed:', error)
          // If auto-play is blocked, pause the player
          setIsPlaying(false)
        })
      }
    } else {
      video.pause()
    }
  }, [isPlaying, current, setIsPlaying])

  // ========================================
  // 4. SYNC VOLUME
  // ========================================
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume
    }
  }, [volume])

  // ========================================
  // 5. ATTACH EVENT LISTENERS
  // ========================================
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Duration loaded
    const handleLoadedData = () => {
      setDuration(video.duration)
    }

    // Playback position update
    const handleTimeUpdate = () => {
      setCurrentPosition(video.currentTime)
    }

    // Track ended - advance to next
    const handleEnded = () => {
      next()
    }

    // Error handling
    const handleError = () => {
      console.error('Video element error:', video.error)
      // Auto-skip on error
      setTimeout(() => next(), 1000)
    }

    // Attach listeners
    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('error', handleError)

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('error', handleError)
    }
  }, [next, setCurrentPosition, setDuration])

  // ========================================
  // 6. PLAY COUNT TRACKING (30s rule)
  // ========================================
  useEffect(() => {
    if (!current || !isPlaying) {
      // Clear timer if paused or no track
      if (playCountTimerRef.current) {
        clearTimeout(playCountTimerRef.current)
        playCountTimerRef.current = null
      }
      return
    }

    // Start 30-second timer
    playCountTimerRef.current = setTimeout(() => {
      const video = videoRef.current
      // Only report if still playing after 30s
      if (video && !video.paused && !video.ended && current) {
        reportPlay(current.id)
      }
    }, 30_000) // 30 seconds

    return () => {
      if (playCountTimerRef.current) {
        clearTimeout(playCountTimerRef.current)
      }
    }
  }, [current?.id, isPlaying, reportPlay])

  // ========================================
  // RETURN API
  // ========================================
  
  /**
   * Seek to a specific time in the current track
   */
  const seekTo = (seconds: number) => {
    const video = videoRef.current
    if (!video) return

    const clampedTime = Math.max(0, Math.min(seconds, video.duration || 0))
    video.currentTime = clampedTime
    setCurrentPosition(clampedTime)
  }

  return {
    seekTo,
  }
}

