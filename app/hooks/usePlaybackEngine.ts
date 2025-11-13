import Hls from 'hls.js'
import { useEffect, useRef } from 'react'

import { useAnalyticsStore } from '~/store/analyticsStore'
import { usePlayerStore } from '~/store/playerStore'
import { NextTrackReason } from '~/types/player'

function isHlsUrl(url: string): boolean {
  return url.includes('.m3u8') || url.includes('hls')
}

export function usePlaybackEngine() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const hlsRef = useRef<Hls | null>(null)

  const {
    currentTrack: current,
    isPlaying,
    volume,
    next,
    setCurrentPosition,
    setDuration,
    setIsPlaying,
  } = usePlayerStore()

  const { startPlayAttempt, reportPlay } = useAnalyticsStore()

  useEffect(() => {
    const video = document.createElement('video')
    video.style.display = 'none'
    video.playsInline = true
    document.body.appendChild(video)
    videoRef.current = video

    return () => {
      video.pause()
      video.src = ''
      document.body.removeChild(video)
      videoRef.current = null
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !current?.audioUrl) return

    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    if (isHlsUrl(current.audioUrl)) {
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
                setTimeout(() => next({ reason: NextTrackReason.TrackEnd }), 1000)
                break
            }
          }
        })
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = current.audioUrl
        video.load()
      } else {
        console.error('HLS not supported in this browser')
      }
    } else {
      video.src = current.audioUrl
      video.load()
    }

    startPlayAttempt(current.id)
  }, [current?.audioUrl, current?.id, next, startPlayAttempt])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !current) return

    if (isPlaying) {
      const playPromise = video.play()

      if (playPromise !== undefined) {
        playPromise.catch(error => {
          if (error.name === 'AbortError') {
            return
          }

          console.error('Playback failed:', error)
          setIsPlaying(false)
        })
      }
    } else {
      video.pause()
    }
  }, [isPlaying, current, setIsPlaying])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume
    }
  }, [volume])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedData = () => {
      setDuration(video.duration)
    }

    const handleTimeUpdate = () => {
      setCurrentPosition(video.currentTime)
    }

    const handleEnded = () => {
      // Record play completion when track ends
      if (current?.id) {
        const duration = Math.floor(video.duration || 0)
        reportPlay(current.id, duration, true)
      }
      next({ reason: NextTrackReason.TrackEnd })
    }

    const handleError = () => {
      console.error('Video element error:', video.error)
      setTimeout(() => next({ reason: NextTrackReason.TrackEnd }), 1000)
    }

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
  }, [next, setCurrentPosition, setDuration, current, reportPlay])

  useEffect(() => {
    if (!current || !isPlaying) return

    reportPlay(current.id)
  }, [current, isPlaying, reportPlay])

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
