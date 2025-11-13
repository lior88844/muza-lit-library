import React, { type MouseEventHandler } from 'react'
import { Link } from 'react-router'
import type { TrackResponse } from 'server/api/track/types/TrackResponse'
import { EntityTypeEnum } from 'server/db/stack.entity'

import MuzaIcon from '~/icons/MuzaIcon'
import { useDraggable } from '~/lib/hooks/useDraggable'
import { cn } from '~/lib/utils'

import { useToggleAddLibrary } from '../../store/media/useToggleAddLibrary'
import { Typography } from '../ui/typography'
import styles from './SongLineWithCover.module.css'

interface SongLineProps {
  track: TrackResponse
  onClick: MouseEventHandler<Element>
  isPlaying: boolean
  showPreview?: boolean
  showHoverActions?: boolean
  draggable?: boolean
  playlistMode?: boolean
  onRemoveSong?: (trackId: number) => void
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
  track,
  onClick,
  isPlaying,
  showPreview = false,
  showHoverActions = true,
  draggable = false,
  playlistMode = false,
  onRemoveSong,
}) => {
  const { toggleAddLibrary, getIsInLibrary } = useToggleAddLibrary()
  const isInLibrary = getIsInLibrary(EntityTypeEnum.Track, track.id)

  const { dragHandlers, preventClickWhileDragging } = useDraggable({
    type: EntityTypeEnum.Track,
    data: track,
    enabled: draggable,
  })

  const addToLibrary = async () => {
    await toggleAddLibrary(EntityTypeEnum.Track, track.id)
  }

  return (
    <div
      className={cn(
        styles.songLineWithCover,
        isPlaying ? styles.playing : '',
        draggable ? styles.draggable : ''
      )}
      {...dragHandlers}
    >
      <div className={styles.songLineWithCoverContent}>
        <div
          className={styles.songLineWithCoverCover}
          onClick={e => preventClickWhileDragging(e, onClick)}
        >
          <img
            src={track.imageSrc || '/art/imag_1.jpg'}
            alt={`${track.title} cover`}
            className={styles.coverImage}
          />
          {!playlistMode && (
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

        <div className={styles.songLineWithCoverInfo}>
          <div className={styles.songLineWithCoverTitleRow}>
            <Typography className='truncate font-medium'>{track.title}</Typography>
          </div>

          <div className={styles.songLineWithCoverDetailsRow}>
            {showPreview && <div className={styles.previewBadge}>Preview</div>}
            <div className={styles.songDetails}>
              <Link className='hover:underline' to={`/artists/${track.artistId}`}>
                {track.artist}
              </Link>
              <span className={styles.separator}>•</span>
              <Link className='hover:underline' to={`/albums/${track.albumId}`}>
                {track.album}
              </Link>
              <span className={styles.separator}>•</span>
              <span>{formatPlayCount(track.playCount || 0)} Plays</span>
            </div>
          </div>
        </div>

        {/* Right Section with Gradient */}
        <div className={styles.songLineWithCoverActions}>
          {playlistMode ? (
            // Playlist mode: show only duration, with trash and checkbox on hover
            <>
              <>
                <button
                  className={styles.trashBtn}
                  title='Remove from playlist'
                  onClick={e => {
                    e.stopPropagation()
                    onRemoveSong?.(track.id)
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
              <span className={styles.duration}>
                {track.time ? formatDuration(track.time) : '00:00'}
              </span>
            </>
          ) : (
            <>
              {showHoverActions && (
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
                {track.time ? formatDuration(track.time) : '00:00'}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default SongLineWithCover
