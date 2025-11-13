import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { usePlaybackEngine } from '~/hooks/usePlaybackEngine'
import MuzaIcon from '~/icons/MuzaIcon'
import { cn } from '~/lib/utils'
import { usePlayerStore } from '~/store/playerStore'
import { NextTrackReason, type RepeatMode } from '~/types/player'

import VolumeControl from '../../controls/VolumeControl'
import { Button } from '../ui/button'

const ScrollingText: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className }) => {
  const textRef = React.useRef<HTMLDivElement>(null)
  const [shouldScroll, setShouldScroll] = useState(false)
  const [animationDuration, setAnimationDuration] = useState('10s')

  React.useEffect(() => {
    if (textRef.current) {
      const element = textRef.current
      const isOverflowing = element.scrollWidth > element.clientWidth
      setShouldScroll(isOverflowing)

      if (isOverflowing) {
        const extraWidth = element.scrollWidth - element.clientWidth
        const duration = Math.max(3, extraWidth / 50)
        setAnimationDuration(`${duration}s`)
      }
    }
  }, [children])

  return (
    <div className='relative overflow-hidden'>
      <div
        ref={textRef}
        className={cn('whitespace-nowrap transition-transform duration-300 ease-linear', className)}
        style={{
          animationName: shouldScroll ? 'marquee' : 'none',
          animationDuration: shouldScroll ? animationDuration : '0s',
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
          animationPlayState: 'paused',
        }}
        onMouseEnter={e => {
          if (shouldScroll) {
            e.currentTarget.style.animationPlayState = 'running'
          }
        }}
        onMouseLeave={e => {
          e.currentTarget.style.animationPlayState = 'paused'
          e.currentTarget.style.transform = 'translateX(0)'
        }}
      >
        {children}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-100% + var(--container-width, 200px))); }
        }
      `}</style>
    </div>
  )
}
const twBtn =
  'transition-all duration-200 ease-in-out hover:scale-105 hover:text-gray-700 active:scale-95 hover:bg-transparent p-0'
export const MusicPlayer = () => {
  const { t } = useTranslation()
  const { seekTo } = usePlaybackEngine()
  const {
    currentTrack,
    isPlaying,
    duration,
    currentPosition,
    volume,
    repeat,
    setVolume,
    setRepeat,
    prev,
    next,
    playPause,
    shuffle,
    toggleShuffle,
  } = usePlayerStore()

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
  if (!currentTrack) return null
  return (
    <div className='fixed right-6 bottom-6 left-[calc(var(--muza-sidebar-width,208px)+24px)] z-1000 flex overflow-hidden rounded-lg border border-(--muza-light-border-color) bg-white/50 shadow-[0_4px_12px_rgba(0,0,0,0.15)] backdrop-blur-[10px] max-md:flex-col'>
      <div className='bg-muted flex w-full max-w-[348px] items-start gap-3 border-r border-(--muza-light-border-color) p-2 max-md:max-w-none max-md:border-t max-md:border-r-0'>
        <img
          className='h-16 w-16 shrink-0 rounded-md object-cover'
          src={currentTrack?.imageSrc || '/art/imag_1.jpg'}
          alt={`${currentTrack?.title || ''} album cover`}
        />
        {currentTrack && (
          <div className='flex min-w-0 flex-1 flex-col gap-2'>
            <ScrollingText className='font-(family-name:--typography-font-family-font-sans) text-(length:--muza-subtitle-font-size) leading-normal font-semibold text-(--muza-track-title-color)'>
              {currentTrack.title}
            </ScrollingText>
            <ScrollingText className='font-(family-name:--typography-font-family-font-sans) text-sm leading-[100%] font-normal text-(--colors_muted_foreground_light)'>
              {currentTrack.artist}
            </ScrollingText>
            <div className='flex gap-1 overflow-hidden text-xs text-(--colors_muted_foreground_light) max-sm:hidden'>
              <ScrollingText className='flex gap-1'>
                {`${currentTrack.album} • ${currentTrack.year}`}
              </ScrollingText>
            </div>
          </div>
        )}
      </div>

      <div className='flex min-w-[400px] flex-1 flex-col gap-2 max-md:min-w-0'>
        <div className='relative p-0'>
          <div className='relative h-2 cursor-pointer bg-gray-100' onClick={handleSeek}>
            <div
              className='h-full bg-blue-500 transition-[width] duration-100 ease-linear'
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className='absolute top-full right-0 left-0 flex justify-between px-4 pt-2 text-xs text-(--colors_muted_foreground_light)'>
            <span>{formatTime(currentPosition)}</span>
            <span>{formatTime(duration - currentPosition)}</span>
          </div>
        </div>

        <div className='relative flex grow items-center px-16 py-1 max-sm:px-3'>
          <div className='flex flex-1 items-center justify-center gap-4 md:gap-6'>
            <Button
              size='icon'
              variant='ghost'
              className={cn(twBtn, shuffle && 'text-primary')}
              onClick={toggleShuffle}
              aria-label={t('player.shuffle')}
            >
              <MuzaIcon iconName='shuffle' className='size-6' />
            </Button>

            <Button
              size='icon'
              variant='ghost'
              className={twBtn}
              onClick={prev}
              aria-label={t('player.previous')}
            >
              <MuzaIcon iconName='skip-back' className='size-6' />
            </Button>

            <Button
              size='icon'
              variant='ghost'
              className={twBtn}
              onClick={togglePlayPause}
              aria-label={t('player.playPause')}
            >
              {isPlaying ? (
                <MuzaIcon iconName='pause' className='size-9' />
              ) : (
                <MuzaIcon iconName='play' className='size-9' />
              )}
            </Button>

            <Button
              size='icon'
              variant='ghost'
              className={twBtn}
              onClick={() => next({ reason: NextTrackReason.ButtonClick })}
              aria-label={t('player.next')}
            >
              <MuzaIcon iconName='skip-forward' className='size-7' />
            </Button>

            <Button
              size='icon'
              variant='ghost'
              className={cn(twBtn, repeat !== 'off' && 'text-primary')}
              onClick={cycleRepeat}
              aria-label={t('player.repeat')}
            >
              <MuzaIcon iconName='repeat' className='size-6' />
            </Button>
          </div>

          <div className='flex items-center pr-8'>
            <VolumeControl
              noSymbol={true}
              value={volume * 100}
              onVolumeChange={handleVolumeChange}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
