import React, { type MouseEventHandler, useState } from 'react'

import MuzaIcon from '~/icons/MuzaIcon'

import type { SongDetails as SongDetailsType } from '../../store/models'
import styles from './SongDetails.module.css'

interface SongDetailsProps {
  details: SongDetailsType
  onClick: MouseEventHandler<HTMLDivElement>
  isPlaying?: boolean
  isActive?: boolean
}

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

const formatPlays = (plays: number): string => {
  return `${plays.toLocaleString()} Plays`
}

const SongDetails: React.FC<SongDetailsProps> = ({
  details,
  onClick,
  isPlaying = false,
  isActive = false,
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isSelected, setIsSelected] = useState(false)

  const handleMouseEnter = () => setIsHovered(true)
  const handleMouseLeave = () => setIsHovered(false)

  const renderPlayButton = () => {
    if (isActive) {
      return <MuzaIcon iconName='pause' />
    }
    return <MuzaIcon iconName='play' />
  }

  return (
    <div
      className={`${styles['song-details']} ${isHovered ? styles.hover : ''} ${isActive ? styles.active : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles['song-info']} onClick={onClick}>
        <div className={styles['cover-container']}>
          <div
            className={styles['cover-image']}
            style={{
              backgroundImage: `url(${details.imageSrc || '/art/imag_1.jpg'})`,
            }}
          >
            {(isHovered || isActive) && (
              <div className={styles['play-overlay']}>
                <div className={styles['play-button']}>{renderPlayButton()}</div>
              </div>
            )}
          </div>
        </div>

        <div className={styles['track-details']}>
          <div className={`${styles['track-title']} ${isActive ? styles.active : ''}`}>
            {details.title}
          </div>
          <div className={styles['track-metadata']}>
            <span className={styles['track-artist']}>{details.artist}</span>
            <span className={styles.separator}>•</span>
            <span className={styles['play-count']}>{formatPlays(details.plays || 0)}</span>
          </div>
        </div>
      </div>

      <div className={styles['song-actions']}>
        {isHovered && (
          <div className={styles['action-buttons']}>
            <button
              className={`${styles['action-btn']} ${styles['heart-btn']}`}
              onClick={() => {
                // Add heart action logic here
              }}
            >
              <MuzaIcon iconName='heart' />
            </button>
            <button
              className={`${styles['action-btn']} ${styles['menu-btn']}`}
              onClick={() => {
                // Add menu action logic here
              }}
            >
              <MuzaIcon iconName='ellipsis' />
            </button>
            <div className={styles['checkbox-container']}>
              <input
                type='checkbox'
                className={styles['song-checkbox']}
                checked={isSelected}
                onChange={e => setIsSelected(e.target.checked)}
              />
            </div>
          </div>
        )}

        {!isHovered && (
          <div className={styles.duration}>
            {details.time ? formatDuration(details.time) : '00:00'}
          </div>
        )}
      </div>
    </div>
  )
}

export default SongDetails
