import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  FaChevronLeft,
  FaEllipsisH,
  FaHeart,
  FaInfo,
  FaPause,
  FaPlay,
  FaPlus,
} from 'react-icons/fa'
import type { EntityTypeEnum } from 'server/db/stack.entity'

import MuzaIcon from '~/icons/MuzaIcon'
import { useCurrentPlayerStore } from '~/store/currentPlayerStore'
import type { MusicPlaylist, SongDetails } from '~/store/models'

import { PlaylistVisibilityEnum } from '../../../server/db/playlist.entity'
import { useToggleAddLibrary } from '../../store/media/useToggleAddLibrary'
import { Button, IconButton } from '../ui/button'
import MediaCover from './components/MediaCover/MediaCover'
import MediaMetadata, { type MediaMetadataProps } from './components/MediaMetadata/MediaMetadata'
import styles from './MediaHeader.module.css'

interface MediaHeaderProps {
  songs: SongDetails[]
  mediaType: EntityTypeEnum
  title: string
  imageSrc: string
  creator?: string
  visibility?: PlaylistVisibilityEnum
  mediaMetadata: Omit<MediaMetadataProps, 'type'>
  entityId: number
  onInfoClick?: () => void
  onAddToPlaylistClick?: () => void
  showBackButton?: boolean
  customActions?: React.ReactNode
  playlist?: MusicPlaylist
  onBackClick?: () => void
}

const MediaHeader: React.FC<MediaHeaderProps> = ({
  songs,
  mediaType,
  title,
  imageSrc,
  creator,
  visibility,
  mediaMetadata,
  entityId,
  showBackButton = true,
  customActions,
  onInfoClick,
  onAddToPlaylistClick,
  playlist,
  onBackClick,
}) => {
  const { t } = useTranslation()
  const { setSelectedSong, isPlaying, setIsPlaying } = useCurrentPlayerStore()
  const { toggleAddLibrary, getIsInLibrary } = useToggleAddLibrary()
  const isInLibrary = getIsInLibrary(mediaType, entityId)
  const onToggleAddLibrary = () => {
    toggleAddLibrary(mediaType, entityId)
  }
  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false)
    } else {
      if (songs.length > 0) {
        setSelectedSong(songs[0])
        setIsPlaying(true)
      }
    }
  }

  const goBack = () => {
    if (onBackClick) {
      onBackClick()
    } else {
      window.history.back()
    }
  }

  const getPlayButtonText = () => {
    switch (mediaType) {
      case 'album':
        return isPlaying ? t('common.pause') : t('common.playAlbum')
      case 'playlist':
        return isPlaying ? t('common.pause') : t('common.playPlaylist')
      case 'artist':
        return isPlaying ? t('common.pause') : t('common.playArtist')
      default:
        return isPlaying ? t('common.pause') : t('common.play')
    }
  }

  return (
    <>
      <div
        className={`${styles['media-header-layout']} ${showBackButton ? styles['has-back-button'] : ''}`}
      >
        {showBackButton && (
          <div className={styles['back-close-section']} data-name='back & close'>
            <IconButton
              icon={<FaChevronLeft />}
              className='text-muted-foreground'
              variant='ghost'
              data-name='back'
              onClick={goBack}
            />
          </div>
        )}

        <div className={styles['media-header']} data-name='Media-Header'>
          <div
            className={`${styles['media-content-section']} ${styles['media-content-section--horizontal']}`}
          >
            <MediaCover
              imageSrc={imageSrc}
              title={title}
              mediaType={mediaType}
              playlist={playlist}
            />

            <div className={styles['info-section']}>
              <div className={styles['titles-section']} data-name='Titles'>
                <div className={styles['title-metadata-group']}>
                  {mediaType === 'playlist' && (
                    <div className={styles['playlist-badge-section']}>
                      <div className={styles['playlist-badge']} data-name='Badge'>
                        <div className={styles['badge-icon']}>
                          <MuzaIcon iconName='ListMusic' />
                        </div>
                        <span className={styles['badge-text']}>Playlist</span>
                      </div>
                      <span className={styles['metadata-separator']}>•</span>
                      <span className={styles['metadata-text']}>{songs.length} Songs</span>
                      <span className={styles['metadata-separator']}>•</span>
                      <span className={styles['metadata-text']}>
                        {Math.floor(
                          songs.reduce((total, song) => total + (song.time || 0), 0) / 60
                        )}
                        h{' '}
                        {Math.floor(
                          songs.reduce((total, song) => total + (song.time || 0), 0) % 60
                        )}
                        min
                      </span>
                    </div>
                  )}

                  <div className={`${styles['title-info']} ${styles['title-info--left']}`}>
                    <div className={styles['album-title']}>{title}</div>
                    {creator && <div className={styles['playlist-description']}>{creator}</div>}
                  </div>

                  {mediaType === 'playlist' && (
                    <div className={styles['user-info-section']}>
                      <div className={styles['user-info']}>
                        <div className={styles['user-avatar']}>
                          <img src='/art/imag_1.jpg' alt='User Avatar' />
                        </div>
                        <span className={styles['user-name']}>User&apos;s Name</span>
                      </div>
                      <div className={styles['visibility-badge']} data-name='Badge'>
                        <div className={styles['badge-icon']}>
                          <MuzaIcon iconName='globe' />
                        </div>
                        <span className={styles['badge-text']}>
                          {visibility === PlaylistVisibilityEnum.Private
                            ? t('common.private')
                            : t('common.public')}
                        </span>
                      </div>
                    </div>
                  )}

                  {mediaType !== 'playlist' && (
                    <MediaMetadata type={mediaType} {...mediaMetadata} />
                  )}
                </div>

                <div className={styles['actions-section']}>
                  <div className={styles['ctas-section']} data-name='CTAs'>
                    <Button
                      variant='outline'
                      size='lg'
                      onClick={handlePlayPause}
                      disabled={songs.length === 0}
                      data-name='Button'
                    >
                      <div className={styles['play-icon']}>
                        {isPlaying ? <FaPause /> : <FaPlay />}
                      </div>
                      <span className={styles['play-text']}>{getPlayButtonText()}</span>
                    </Button>
                  </div>

                  <div
                    className={`${styles['action-buttons']} ${styles['action-buttons--end']} ${styles['action-buttons--gap-medium']}`}
                  >
                    {customActions || (
                      <>
                        <IconButton
                          icon={isInLibrary ? <FaHeart /> : <FaPlus />}
                          variant='ghost'
                          data-name='Add-Library Button'
                          onClick= {onAddToPlaylistClick || onToggleAddLibrary}
                        />
                        <IconButton
                          icon={<FaInfo />}
                          variant='ghost'
                          data-name='Info Button'
                          onClick={onInfoClick}
                        />
                        <IconButton
                          icon={<FaEllipsisH />}
                          variant='ghost'
                          data-name='Menu Button'
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default MediaHeader
