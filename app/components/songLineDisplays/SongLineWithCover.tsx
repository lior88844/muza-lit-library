import React, { type MouseEventHandler, useState } from 'react'

import MuzaIcon from '~/icons/MuzaIcon'

import { MediaTypeEnum } from '../../../server/db/user-library.entity'
import { useToggleAddLibrary } from '../../store/media/useToggleAddLibrary'
import type { SongDetails } from '../../store/models'
import styles from './SongLineWithCover.module.css'

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

  return (
    <div
      className={`${styles.songLineWithCover} ${isPlaying ? styles.playing : ''} ${draggable ? styles.draggable : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.songLineWithCoverContent}>
        {/* Album Cover */}
        <div className={styles.songLineWithCoverCover} onClick={handleClick}>
          <img
            src={details.imageSrc || '/art/imag_1.jpg'}
            alt={`${details.title} cover`}
            className={styles.coverImage}
          />
          {isHovered && !playlistMode && (
            <div className={styles.playOverlay}>
              <button
                className={styles.playButton}
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
        <div className={styles.songLineWithCoverInfo}>
          <div className={styles.songLineWithCoverTitleRow}>
            <h3 className={styles.songTitle}>{details.title}</h3>
          </div>

          <div className={styles.songLineWithCoverDetailsRow}>
            {showPreview && <div className={styles.previewBadge}>Preview</div>}
            <div className={styles.songDetails}>
              <span className={styles.artistName}>{details.artist}</span>
              <span className={styles.separator}>•</span>
              <span className={styles.albumName}>{details.album || 'Unknown Album'}</span>
              <span className={styles.separator}>•</span>
              <span className={styles.playCount}>
                {details.plays ? formatPlayCount(details.plays) : '0'} Plays
              </span>
            </div>
          </div>
        </div>

        {/* Right Section with Gradient */}
        <div className={styles.songLineWithCoverActions}>
          {playlistMode ? (
            // Playlist mode: show only duration, with trash and checkbox on hover
            <>
              {isHovered && (
                <>
                  <button
                    className={styles.trashBtn}
                    title='Remove from playlist'
                    onClick={e => {
                      e.stopPropagation()
                      onRemoveSong?.(details)
                    }}
                  >
                    <MuzaIcon iconName='trash' />
                  </button>
                  <button
                    className={styles.checkboxBtn}
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
              <span className={styles.duration}>
                {details.time ? formatDuration(details.time) : '00:00'}
              </span>
            </>
          ) : (
            <>
              {showHoverActions && isHovered && (
                <button
                  className={styles.ellipsisBtn}
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
                className={styles.addBtn}
                title='Add to library'
                onClick={e => {
                  e.stopPropagation()
                  addToLibrary()
                }}
              >
                <MuzaIcon iconName={isInLibrary ? 'heart' : 'plus'} />
              </button>

              <span className={styles.duration}>
                {details.time ? formatDuration(details.time) : '00:00'}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default SongLineWithCover
