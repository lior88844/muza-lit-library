import React from 'react'
import { useTranslation } from 'react-i18next'
import { FaPause, FaPlay } from 'react-icons/fa'
import type { EntityTypeEnum } from 'server/db/stack.entity'

import MuzaButton from '~/controls/MuzaButton'
import MuzaIcon from '~/icons/MuzaIcon'
import type { MusicPlaylist, SongDetails } from '~/store/models'
// Removed unused imports: useSubmit, useActionData
import { usePlayerStore } from '~/store/playerStore'

import { PlaylistVisibilityEnum } from '../../../server/db/playlist.entity'
import { useToggleAddLibrary } from '../../store/media/useToggleAddLibrary'
import { Button } from '../ui/button'
// Import remaining sub-components
import MediaCover from './components/MediaCover/MediaCover'
import MediaMetadata, { type MediaMetadataProps } from './components/MediaMetadata/MediaMetadata'
import styles from './MediaHeader.module.css'

interface MediaHeaderProps {
  // Generic media object that works for albums, playlists, etc.
  songs: SongDetails[]
  mediaType: EntityTypeEnum
  title: string
  imageSrc: string
  creator?: string
  visibility?: PlaylistVisibilityEnum
  mediaMetadata: Omit<MediaMetadataProps, 'type'>
  // Resource identification for library operations
  entityId: number
  // Optional customization
  onInfoClick?: () => void
  showBackButton?: boolean
  customActions?: React.ReactNode
  // For playlist cover generation
  playlist?: MusicPlaylist
  // Custom back button handler
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
  playlist,
  onBackClick,
}) => {
  const { t } = useTranslation()
  const { playQueue, isPlaying, playPause } = usePlayerStore()
  const { toggleAddLibrary, getIsInLibrary } = useToggleAddLibrary()
  const isInLibrary = getIsInLibrary(mediaType, entityId)
  const onToggleAddLibrary = () => {
    toggleAddLibrary(mediaType, entityId)
  }
  const handlePlayPause = () => {
    if (isPlaying) {
      // If currently playing, pause
      playPause(false)
    } else {
      if (songs.length > 0) {
        // Play from start - load entire collection as queue
        playQueue({
          items: songs,
          startIndex: 0,
          source: {
            type: mediaType,
            id: entityId,
            title: title,
          },
        })
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
            <MuzaButton
              iconName='ChevronDown'
              onClick={goBack}
              size='small'
              className={styles['back-button']}
              data-name='back'
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
                  {/* Playlist Badge and Metadata */}
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

                  {/* Title */}
                  <div className={`${styles['title-info']} ${styles['title-info--left']}`}>
                    <div className={styles['album-title']}>{title}</div>
                    {creator && <div className={styles['playlist-description']}>{creator}</div>}
                  </div>

                  {/* User Info Section for Playlists */}
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

                  {/* Non-playlist metadata */}
                  {mediaType !== 'playlist' && (
                    <MediaMetadata type={mediaType} {...mediaMetadata} />
                  )}
                </div>

                <div className={styles['actions-section']}>
                  {/* PlayButton content inlined */}
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

                  {/* ActionButtonGroup content inlined */}
                  <div
                    className={`${styles['action-buttons']} ${styles['action-buttons--end']} ${styles['action-buttons--gap-medium']}`}
                  >
                    {customActions || (
                      <>
                        <MuzaButton
                          iconName={isInLibrary ? 'heart' : 'plus'}
                          onClick={onToggleAddLibrary}
                          size='medium'
                          data-name='Add-Download Button'
                        />
                        <MuzaButton
                          iconName='info'
                          onClick={onInfoClick}
                          size='medium'
                          data-name='Info Button'
                        />
                        <MuzaButton
                          iconName='ellipsis'
                          onClick={() => {}}
                          size='medium'
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
