import './SongLine.scss'

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
  showPreview?: boolean
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
}) => {
  const { toggleAddLibrary, getIsInLibrary } = useToggleAddLibrary()
  const [isHovered, setIsHovered] = useState(false)
  const isInLibrary = getIsInLibrary(MediaTypeEnum.Track, details.id)

  const addToLibrary = async () => {
    await toggleAddLibrary(MediaTypeEnum.Track, details.id)
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
      className={`song-line-simple ${isPlaying ? 'playing' : ''} ${isHovered ? 'hovered' : ''}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className='song-container'>
        <div className='track-info'>
          <div className='track-icon'>{renderIcon()}</div>
          <div className='track-details'>
            <div className='track-title-row'>
              <span className='track-title'>{details.title}</span>
              {showPreview && <span className='preview-badge'>Preview</span>}
            </div>
            <div className='track-meta-row'>
              <span className='track-artist'>{details.artist}</span>
              {details.album && (
                <>
                  <span className='separator'>•</span>
                  <span className='track-album'>{details.album}</span>
                </>
              )}
              {details.plays && (
                <>
                  <span className='separator'>•</span>
                  <span className='track-plays'>{formatPlayCount(details.plays)} Plays</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className='track-actions'>
          {isHovered && (
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
          <span className='track-duration'>{details.time ? formatDuration(details.time) : ''}</span>
        </div>
      </div>
    </div>
  )
}

export default SongLine
