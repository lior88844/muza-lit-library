import './SongLineWithCover.scss'

import React, { type MouseEventHandler, useState } from 'react'

import MuzaIcon from '~/icons/MuzaIcon'

import { MediaTypeEnum } from '../../../server/db/user-library.entity'
import { useToggleAddLibrary } from '../../store/media/useToggleAddLibrary'
import type { SongDetails } from '../../store/models'
import { formatSongNumber } from '../../store/utils'

interface SongLineProps {
  details: SongDetails
  onClick: MouseEventHandler<HTMLDivElement>
  isPlaying: boolean
  showPreview?: boolean // Add preview badge option
  showHoverActions?: boolean // Control hover action visibility
  draggable?: boolean // Enable drag functionality
  playlistMode?: boolean // Enable playlist-specific behavior
  onRemoveSong?: (song: SongDetails) => void // Callback for removing song from playlist
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

const SongLineWithCover: React.FC<SongLineProps> = ({
  details,
  onClick,
  isPlaying,
  showPreview = false,
  showHoverActions = true,
  draggable = false,
  playlistMode = false,
  onRemoveSong,
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const { toggleAddLibrary, getIsInLibrary } = useToggleAddLibrary()
  const isInLibrary = getIsInLibrary(MediaTypeEnum.Track, details.id)
  const addToLibrary = async () => {
    await toggleAddLibrary(MediaTypeEnum.Track, details.id)
  }

  const handleDragStart = (e: React.DragEvent) => {
    if (!draggable) return

    setIsDragging(true)

    const dragData = {
      type: 'song',
      song: details,
    }

    e.dataTransfer.setData('application/json', JSON.stringify(dragData))
    e.dataTransfer.effectAllowed = 'copy'
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    onClick(e)
  }

  const renderIcon = () => {
    if (isPlaying && isHovered) {
      return (
        <span className='pause-icon'>
          <MuzaIcon iconName='pause' />
        </span>
      )
    }
    if (isPlaying) {
      return (
        <div className='wave-container'>
          <div className='bar' />
          <div className='bar' />
          <div className='bar' />
        </div>
      )
    }
    return (
      <>
        <span className='track-number'>{formatSongNumber(details.index || 1)}</span>
        <span className='play-icon'>
          <MuzaIcon iconName='play' />
        </span>
      </>
    )
  }

  return (
    <div
      className={`song-line-with-cover ${isPlaying ? 'playing' : ''} ${draggable ? 'draggable' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className='song-line-with-cover__content'>
        {/* Album Cover */}
        <div className='song-line-with-cover__cover' onClick={handleClick}>
          <img src={details.imageSrc || '/art/imag_1.jpg'} alt={`${details.title} cover`} className='cover-image' />
          {isHovered && !playlistMode && (
            <div className='play-overlay'>
              <button
                className='play-button'
                onClick={e => {
                  e.stopPropagation()
                  onClick(e as unknown as React.MouseEvent<HTMLDivElement>)
                }}
              >
                <MuzaIcon iconName={isPlaying ? 'pause' : 'play'} />
              </button>
            </div>
          )}
        </div>

        {/* Song Info */}
        <div className='song-line-with-cover__info'>
          <div className='song-line-with-cover__title-row'>
            <h3 className='song-title'>{details.title}</h3>
          </div>

          <div className='song-line-with-cover__details-row'>
            {showPreview && <div className='preview-badge'>Preview</div>}
            <div className='song-details'>
              <span className='artist-name'>{details.artist}</span>
              <span className='separator'>•</span>
              <span className='album-name'>{details.album || 'Unknown Album'}</span>
              <span className='separator'>•</span>
              <span className='play-count'>{details.plays ? formatPlayCount(details.plays) : '0'} Plays</span>
            </div>
          </div>
        </div>

        {/* Right Section with Gradient */}
        <div className='song-line-with-cover__actions'>
          {playlistMode ? (
            // Playlist mode: show only duration, with trash and checkbox on hover
            <>
              {isHovered && (
                <>
                  <button
                    className='trash-btn'
                    title='Remove from playlist'
                    onClick={e => {
                      e.stopPropagation()
                      onRemoveSong?.(details)
                    }}
                  >
                    <MuzaIcon iconName='trash' />
                  </button>
                  <button
                    className='checkbox-btn'
                    title='Select song'
                    onClick={e => {
                      e.stopPropagation()
                      // Handle song selection
                    }}
                  >
                    <MuzaIcon iconName='EmptySquare' />
                  </button>
                </>
              )}
              <span className='duration'>{details.time ? formatDuration(details.time) : '00:00'}</span>
            </>
          ) : (
            <>
              {showHoverActions && isHovered && (
                <button
                  className='ellipsis-btn'
                  title='More options'
                  onClick={e => {
                    e.stopPropagation()
                    // Handle more options
                  }}
                >
                  <MuzaIcon iconName='ellipsis' />
                </button>
              )}

              <button
                className='add-btn'
                title='Add to library'
                onClick={e => {
                  e.stopPropagation()
                  addToLibrary()
                }}
              >
                <MuzaIcon iconName={isInLibrary ? 'heart' : 'plus'} />
              </button>

              <span className='duration'>{details.time ? formatDuration(details.time) : '00:00'}</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default SongLineWithCover
