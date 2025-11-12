import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { MiniAlbum } from 'server/api/album/types/MiniAlbumResponse'
import type { ArtistMiniResponse } from 'server/api/artist/types/ArtistResponse'
import type { MiniPlaylistResponse } from 'server/api/playlist/types/MiniPlaylistResponse'
import type { StackWithEntities } from 'server/api/stack/stack.service'
import type { TrackResponse } from 'server/api/track/types/TrackResponse'
import { EntityTypeEnum } from 'server/db/stack.entity'

import { cn } from '~/lib/utils'
import { useCurrentPlayerStore } from '~/store/currentPlayerStore'

import AlbumPreview from '../albumDisplays/AlbumPreview'
import PlaylistCover from '../albumDisplays/PlaylistCover'
import ArtistPreview from '../artistDisplays/ArtistPreview'
import SongLineWithCover from '../songLineDisplays/SongLineWithCover'
import { Button } from '../ui/button'
import { Typography } from '../ui/typography'
import styles from './MusicListSection.module.css'

const MusicListSectionComponent: React.FC<{
  stack: StackWithEntities
  onShowAll: (stack: StackWithEntities) => void
}> = ({ stack }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const { t } = useTranslation()
  const {
    selectedSong: globalSelectedSong,
    setSelectedSong,
    setIsPlaying,
    isPlaying,
    togglePlayPause,
    isPlaylistDrawerOpen,
    isStackDrawerOpen,
  } = useCurrentPlayerStore()

  const MAX_ITEMS_TO_SHOW = 5
  const itemsToShow = isExpanded ? stack.items : stack.items.slice(0, MAX_ITEMS_TO_SHOW)

  const renderContent = () => {
    switch (stack.entityType) {
      case EntityTypeEnum.Album:
        return itemsToShow.map(item => (
          <AlbumPreview
            key={item.id}
            details={item.entity as MiniAlbum}
            draggable={isPlaylistDrawerOpen || isStackDrawerOpen}
          />
        ))
      case EntityTypeEnum.Artist:
        return itemsToShow.map(item => (
          <ArtistPreview
            key={item.id}
            details={item.entity as ArtistMiniResponse}
            draggable={isStackDrawerOpen}
          />
        ))
      case EntityTypeEnum.Playlist:
        return itemsToShow.map(item => {
          const playlist = item.entity as MiniPlaylistResponse
          return (
            <PlaylistCover
              key={item.id}
              albumImages={playlist.imageSrc ? [playlist.imageSrc] : null}
              title={playlist.title}
              songsCount={playlist.trackCount.toString()}
              userName={playlist.author || t('common.unknown')}
            />
          )
        })
      case EntityTypeEnum.Track:
        return itemsToShow.map(item => {
          const track = item.entity as TrackResponse
          return (
            <SongLineWithCover
              key={track.id}
              details={track}
              onClick={() => {
                if (globalSelectedSong?.id === track.id) {
                  togglePlayPause()
                } else {
                  setSelectedSong(track)
                  setIsPlaying(true)
                }
              }}
              isPlaying={track.id === globalSelectedSong?.id && !!isPlaying}
              draggable={isPlaylistDrawerOpen || isStackDrawerOpen}
            />
          )
        })
      default:
        return null
    }
  }

  const getContentClass = () => {
    switch (stack.entityType) {
      case EntityTypeEnum.Artist:
        return styles['artist-list']
      case EntityTypeEnum.Track:
        return cn('grid gap-2 grid-cols-2 lg:grid-cols-3')
      case EntityTypeEnum.Album:
      case EntityTypeEnum.Playlist:
      default:
        return cn(
          'grid gap-4',
          'grid-cols-2',

          'md:max-[892px]:grid-cols-3',

          'min-[892px]:max-lg:grid-cols-4',

          'lg:grid-cols-5',

          !isExpanded && [
            'max-md:[&>*:nth-child(n+3)]:!hidden',

            'md:max-[892px]:[&>*:nth-child(3)]:flex',
            'md:max-[892px]:[&>*:nth-child(n+4)]:!hidden',

            'min-[892px]:max-lg:[&>*:nth-child(3)]:flex',
            'min-[892px]:max-lg:[&>*:nth-child(4)]:flex',
            'min-[892px]:max-lg:[&>*:nth-child(5)]:!hidden',

            'lg:[&>*:nth-child(5)]:flex',
          ]
        )
    }
  }

  return (
    <div className={styles['music-list-section']}>
      <div className='mb-4 flex items-center justify-between'>
        <Typography variant='h4'>{stack.title}</Typography>

        {stack.items.length > MAX_ITEMS_TO_SHOW && (
          <Button variant='ghost' size='sm' onClick={() => setIsExpanded(prev => !prev)}>
            {isExpanded ? t('action.showLess') : t('action.showAll')}
          </Button>
        )}
      </div>

      <div className={getContentClass()}>{renderContent()}</div>
    </div>
  )
}

export default MusicListSectionComponent
