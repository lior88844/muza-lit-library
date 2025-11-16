import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import type { TrackResponse } from 'server/api/track/types/TrackResponse'
import { EntityTypeEnum } from 'server/db/stack.entity'

import MuzaIcon from '~/icons/MuzaIcon'
import { useDraggable } from '~/lib/hooks/useDraggable'
import { cn } from '~/lib/utils'
import { usePlayerStore } from '~/store/playerStore'
import type { QueueItem } from '~/types/player'

import { useToggleAddLibrary } from '../../store/media/useToggleAddLibrary'
import AddToPlaylistModal from '../playlistDisplays/AddToPlaylistModal'
import { Button } from '../ui/button'
import DropdownMenu, { type DropdownMenuItem } from '../ui/DropdownMenu'
import { Typography } from '../ui/typography'

interface SongLineProps {
  track: TrackResponse
  onClick?: (track: TrackResponse) => void
  showPreview?: boolean
  showHoverActions?: boolean
  draggable?: boolean
  playlistMode?: boolean
  onRemoveSong?: (trackId: number) => void
  albumMode?: boolean
}

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

const formatPlayCount = (plays: number): string => {
  if (plays < 1000) return plays.toString()
  if (plays < 1000000) return `${(plays / 1000).toFixed(1)}K`
  return `${(plays / 1000000).toFixed(1)}M`
}

const TrackPreview: React.FC<SongLineProps> = ({
  track,
  onClick,
  showPreview,
  showHoverActions = true,
  draggable = false,
  playlistMode,
  albumMode,
  onRemoveSong,
}) => {
  const navigate = useNavigate()
  const { toggleAddLibrary, getIsInLibrary } = useToggleAddLibrary()
  const { addToQueue, currentTrack } = usePlayerStore()
  const isPlaying = currentTrack?.id === track.id
  const isInLibrary = getIsInLibrary(EntityTypeEnum.Track, track.id)
  const [isAddToPlaylistModalOpen, setIsAddToPlaylistModalOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const { dragHandlers, preventClickWhileDragging } = useDraggable({
    type: EntityTypeEnum.Track,
    data: track,
    enabled: draggable,
  })

  const addToLibrary = async () => {
    await toggleAddLibrary(EntityTypeEnum.Track, track.id)
  }

  // Convert TrackResponse to QueueItem
  const trackToQueueItem = (track: TrackResponse): QueueItem => ({
    id: track.id,
    audioUrl: track.audioUrl,
    title: track.title,
    artist: track.artist,
    album: track.album,
    albumId: track.albumId,
    imageSrc: track.imageSrc,
    duration: track.time,
    year: track.year,
    artistId: track.artistId,
    plays: track.playCount,
  })

  // Build dropdown menu items
  const menuItems: DropdownMenuItem[] = []

  // Add to playlist - always show
  menuItems.push({
    id: 'add-to-playlist',
    title: 'Add to playlist',
    icon: 'ListMusic',
    onClick: () => {
      setIsAddToPlaylistModalOpen(true)
    },
  })

  // Remove from this playlist - only show if in playlist mode
  if (onRemoveSong) {
    menuItems.push({
      id: 'remove-from-playlist',
      title: 'Remove from this playlist',
      icon: 'trash',
      onClick: () => {
        onRemoveSong(track.id)
      },
      destructive: true,
    })
  }

  // Add to queue - always show
  menuItems.push({
    id: 'add-to-queue',
    title: 'Add to queue',
    icon: 'plus',
    onClick: () => {
      addToQueue(trackToQueueItem(track))
    },
  })

  // Go to artist - always show
  menuItems.push({
    id: 'go-to-artist',
    title: 'Go to artist',
    icon: 'user',
    onClick: () => {
      navigate(`/artists/${track.artistId}`)
    },
  })

  // Go to album - only show if not in album mode
  if (!albumMode) {
    menuItems.push({
      id: 'go-to-album',
      title: 'Go to album',
      icon: 'album',
      onClick: () => {
        navigate(`/albums/${track.albumId}`, { state: { trackId: track.id } })
      },
    })
  }

  return (
    <div
      className={cn(
        'group cursor-pointer overflow-hidden rounded-lg bg-(--colors_background_light) transition-all duration-200',
        'hover:bg-(--muza-hover-background)',
        draggable && 'cursor-grab touch-none select-none active:cursor-grabbing'
      )}
      {...dragHandlers}
    >
      <div className='flex h-[54px] items-center justify-between gap-2 px-0 py-px pl-3'>
        {/* Cover Section */}
        <div
          className={cn(
            'relative size-11 shrink-0 cursor-pointer overflow-hidden rounded',
            !albumMode && 'shadow-sm'
          )}
          onClick={onClick ? e => preventClickWhileDragging(e, () => onClick(track)) : undefined}
        >
          <div className='flex size-full items-center justify-center'>
            {albumMode ? (
              <span
                className={cn(
                  'text-muted-foreground text-xl transition-opacity duration-200 group-hover:opacity-0',
                  isPlaying && 'opacity-0'
                )}
              >
                {track.index || 1}
              </span>
            ) : (
              <img
                src={track.imageSrc || '/art/imag_1.jpg'}
                alt={`${track.title} cover`}
                className='h-full w-full bg-(--muza-image-background-color-bg) object-cover'
              />
            )}
          </div>
          {!playlistMode && (
            <div
              className={cn(
                'absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-200 group-hover:opacity-100',
                !albumMode && 'bg-[rgba(3,7,18,0.5)]',
                isPlaying && 'opacity-100'
              )}
            >
              <Button
                size='icon'
                variant='ghost'
                className={cn(albumMode ? 'text-foreground' : 'text-white')}
                onClick={onClick ? () => onClick(track) : undefined}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                <MuzaIcon iconName={isPlaying ? 'pause' : 'play'} />
              </Button>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className='flex min-w-0 flex-1 flex-col gap-1'>
          <Link
            className='flex items-end gap-2'
            to={!albumMode ? `/albums/${track.albumId}` : ''}
            state={!albumMode ? { trackId: track.id } : undefined}
          >
            <Typography className='truncate font-medium'>{track.title}</Typography>
          </Link>

          <div className='flex items-center gap-2 font-sans text-base leading-none font-normal text-(--colors_muted_foreground_light)'>
            {showPreview && (
              <div className='rounded border-[0.5px] border-(--muza-light-border-color) bg-white/50 px-3 py-0.5 text-sm font-normal whitespace-nowrap text-(--colors_background_dark) backdrop-blur'>
                Preview
              </div>
            )}
            <div className='flex items-center gap-2 text-sm whitespace-nowrap'>
              <Link className='hover:underline' to={`/artists/${track.artistId}`}>
                {track.artist}
              </Link>
              {!albumMode && (
                <>
                  <span className='shrink-0 text-(--colors_muted_foreground_light)'>•</span>
                  <Link className='hover:underline' to={`/albums/${track.albumId}`}>
                    {track.album}
                  </Link>
                </>
              )}
              <span className='shrink-0 text-(--colors_muted_foreground_light)'>•</span>
              <span>{formatPlayCount(track.playCount || 0)} Plays</span>
            </div>
          </div>
        </div>

        {/* Actions Section with Gradient */}
        <div
          className={cn(
            'relative flex h-full shrink-0 items-center gap-3 bg-linear-to-r from-white/0 from-[4.82%] to-white to-[19.26%] pr-3 pl-6 group-hover:from-[rgba(249,250,251,0)] group-hover:to-(--muza-hover-background)'
            // isPlaying && 'from-[rgba(249,250,251,0)] to-(--muza-hover-background)'
          )}
        >
          {playlistMode ? (
            // Playlist mode: show dropdown menu, checkbox, and duration
            <>
              {showHoverActions && (
                <DropdownMenu
                  trigger={
                    <Button
                      size='icon'
                      variant='ghost'
                      className='opacity-0 transition-all duration-200 group-hover:opacity-100'
                      title='More options'
                      onClick={e => {
                        e.stopPropagation()
                      }}
                    >
                      <MuzaIcon iconName='ellipsis' />
                    </Button>
                  }
                  items={menuItems}
                />
              )}
              <Button
                size='icon'
                variant='ghost'
                className='opacity-0 transition-all duration-200 group-hover:opacity-100'
                title='Select song'
                onClick={e => {
                  e.stopPropagation()
                  // Handle song selection
                }}
              >
                <MuzaIcon iconName='EmptySquare' />
              </Button>
              <span className='relative z-1 w-9 text-right font-sans text-sm leading-4 font-normal whitespace-nowrap text-(--colors_background_dark) group-hover:hidden'>
                {track.time ? formatDuration(track.time) : '00:00'}
              </span>
            </>
          ) : (
            <>
              {showHoverActions && (
                <DropdownMenu
                  open={isDropdownOpen}
                  onOpenChange={setIsDropdownOpen}
                  trigger={
                    <Button
                      size='icon'
                      variant='ghost'
                      className={cn(
                        'opacity-0 transition-all duration-200 group-hover:opacity-100',
                        isDropdownOpen && 'opacity-100'
                      )}
                      title='More options'
                      onClick={e => {
                        e.stopPropagation()
                      }}
                    >
                      <MuzaIcon iconName='ellipsis' />
                    </Button>
                  }
                  items={menuItems}
                />
              )}

              <Button
                size='icon'
                variant='ghost'
                title='Add to library'
                onClick={e => {
                  e.stopPropagation()
                  addToLibrary()
                }}
              >
                <MuzaIcon className='size-4' iconName={isInLibrary ? 'heart' : 'plus'} />
              </Button>

              <span className='w-9 text-sm leading-4 whitespace-nowrap text-(--colors_background_dark)'>
                {track.time ? formatDuration(track.time) : '00:00'}
              </span>
            </>
          )}
        </div>
      </div>

      <AddToPlaylistModal
        isOpen={isAddToPlaylistModalOpen}
        onClose={() => setIsAddToPlaylistModalOpen(false)}
        tracksToAdd={[track]}
      />
    </div>
  )
}

export default TrackPreview
