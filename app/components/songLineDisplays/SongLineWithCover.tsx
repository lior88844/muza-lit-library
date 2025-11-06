import React, { type MouseEventHandler, useState } from 'react'
import { EntityTypeEnum } from 'server/db/stack.entity'

import MuzaIcon from '~/icons/MuzaIcon'
import { useDraggable } from '~/lib/hooks/useDraggable'

import { useToggleAddLibrary } from '../../store/media/useToggleAddLibrary'
import type { SongDetails } from '../../store/models'
import styles from './SongLineWithCover.module.css'

interface SongLineProps {
  details: SongDetails
  onClick: MouseEventHandler<Element>
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
  const { toggleAddLibrary, getIsInLibrary } = useToggleAddLibrary()
  const isInLibrary = getIsInLibrary(EntityTypeEnum.Track, details.id)

  const { dragHandlers, preventClickWhileDragging } = useDraggable({
    type: 'song',
    data: details,
    enabled: draggable,
  })

  const addToLibrary = async () => {
    await toggleAddLibrary(EntityTypeEnum.Track, details.id)
  }

  return (
    <div
      className={`${styles.songLineWithCover} ${isPlaying ? styles.playing : ''} ${draggable ? styles.draggable : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...dragHandlers}
    >
      <div className={styles.songLineWithCoverContent}>
        {/* Album Cover */}
        <div
          className={styles.songLineWithCoverCover}
          onClick={e => preventClickWhileDragging(e, onClick)}
        >
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
              <span>{details.artist}</span>
              <span className={styles.separator}>•</span>
              <span>{details.album || 'Unknown Album'}</span>
              <span className={styles.separator}>•</span>
              <span>{details.plays ? formatPlayCount(details.plays) : '0'} Plays</span>
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
