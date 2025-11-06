import React, { type MouseEventHandler, useState } from 'react'
import { EntityTypeEnum } from 'server/db/stack.entity'

import MuzaIcon from '~/icons/MuzaIcon'
import { useDraggable } from '~/lib/hooks/useDraggable'

import { useToggleAddLibrary } from '../../store/media/useToggleAddLibrary'
import type { SongDetails } from '../../store/models'
import { formatSongNumber } from '../../store/utils'
import styles from './SongLine.module.css'

interface SongLineProps {
  details: SongDetails
  onClick: MouseEventHandler<HTMLDivElement>
  isPlaying: boolean
  showPreview?: boolean
  draggable?: boolean
}

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

const formatPlayCount = (plays: number): string => {
  if (plays < 1000) return plays.toString()
  if (plays < 1000000) {
    const thousands = (plays / 1000).toFixed(3)
    return thousands.replace(/\.?0+$/, '') // Remove trailing zeros
  }
  const millions = (plays / 1000000).toFixed(3)
  return `${millions.replace(/\.?0+$/, '')}M` // Remove trailing zeros
}

const SongLine: React.FC<SongLineProps> = ({
  details,
  onClick,
  isPlaying,
  showPreview = false,
  draggable = false,
}) => {
  const { toggleAddLibrary, getIsInLibrary } = useToggleAddLibrary()
  const [isHovered, setIsHovered] = useState(false)
  const isInLibrary = getIsInLibrary(EntityTypeEnum.Track, details.id)
  const { dragHandlers } = useDraggable({
    type: 'song',
    data: details,
    enabled: draggable,
  })

  const addToLibrary = async () => {
    await toggleAddLibrary(EntityTypeEnum.Track, details.id)
  }

  const renderIcon = () => {
    if (isPlaying && isHovered) {
      return (
        <span className={styles['pause-icon']}>
          <MuzaIcon iconName='pause' />
        </span>
      )
    }

    if (isPlaying) {
      return (
        <div className={styles['wave-container']}>
          <div className={styles.bar} />
          <div className={styles.bar} />
          <div className={styles.bar} />
        </div>
      )
    }

    return (
      <>
        <span className={styles['track-number']}>{formatSongNumber(details.index || 1)}</span>
        <span className={styles['play-icon']}>
          <MuzaIcon iconName='play' />
        </span>
      </>
    )
  }

  return (
    <div
      className={`${styles['song-line-simple']} ${isPlaying ? styles.playing : ''} ${isHovered ? styles.hovered : ''}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...dragHandlers}
    >
      <div className={styles['song-container']}>
        <div className={styles['track-info']}>
          <div className={styles['track-icon']}>{renderIcon()}</div>
          <div className={styles['track-details']}>
            <div className={styles['track-title-row']}>
              <span className={styles['track-title']}>{details.title}</span>
              {showPreview && <span className={styles['preview-badge']}>Preview</span>}
            </div>
            <div className={styles['track-meta-row']}>
              <span className={styles['track-artist']}>{details.artist}</span>
              {details.album && (
                <>
                  <span className={styles.separator}>•</span>
                  <span className={styles['track-album']}>{details.album}</span>
                </>
              )}
              {details.plays && (
                <>
                  <span className={styles.separator}>•</span>
                  <span className={styles['track-plays']}>
                    {formatPlayCount(details.plays)} Plays
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className={styles['track-actions']}>
          {isHovered && (
            <button
              className={styles['ellipsis-btn']}
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
            className={styles['add-btn']}
            title='Add to library'
            onClick={e => {
              e.stopPropagation()
              addToLibrary()
            }}
          >
            <MuzaIcon iconName={isInLibrary ? 'heart' : 'plus'} />
          </button>
          <span className={styles['track-duration']}>
            {details.time ? formatDuration(details.time) : ''}
          </span>
        </div>
      </div>
    </div>
  )
}

export default SongLine
