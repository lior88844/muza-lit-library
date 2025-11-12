import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { MiniAlbum } from 'server/api/album/types/MiniAlbumResponse'
import type { ArtistMiniResponse } from 'server/api/artist/types/ArtistResponse'
import type { MiniPlaylistResponse } from 'server/api/playlist/types/MiniPlaylistResponse'
import type { StackWithEntities } from 'server/api/stack/stack.service'
import type { TrackResponse } from 'server/api/track/types/TrackResponse'
import { EntityTypeEnum } from 'server/db/stack.entity'

import { useDrawerStore } from '~/store/drawerStore'
import { usePlayerStore } from '~/store/playerStore'

import AlbumPreview from '../albumDisplays/AlbumPreview'
import PlaylistCover from '../albumDisplays/PlaylistCover'
import ArtistPreview from '../artistDisplays/ArtistPreview'
import SongLineWithCover from '../songLineDisplays/SongLineWithCover'
import { Typography } from '../ui/typography'
import styles from './MusicListSection.module.css'

const MusicListSectionComponent: React.FC<{
  stack: StackWithEntities
  onShowAll: (stack: StackWithEntities) => void
}> = ({ stack }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const { t } = useTranslation()
  const {
    current: globalSelectedSong,
    playQueue,
    isPlaying,
    playPause,
  } = usePlayerStore()
  const { isPlaylistDrawerOpen, isStackDrawerOpen } = useDrawerStore()

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
        return itemsToShow.map((item, index) => {
          const track = item.entity as TrackResponse
          const allTracks = stack.items.map(i => i.entity as TrackResponse)
          return (
            <SongLineWithCover
              key={track.id}
              details={track}
              onClick={() => {
                if (globalSelectedSong?.id === track.id) {
                  playPause()
                } else {
                  playQueue({
                    items: allTracks,
                    startIndex: index,
                    source: {
                      type: 'stack',
                      id: stack.id,
                      title: stack.title,
                    },
                  })
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

  // Determine the appropriate CSS class based on type
  const getContentClass = () => {
    switch (stack.entityType) {
      case EntityTypeEnum.Album:
        return styles['album-list']
      case EntityTypeEnum.Artist:
        return styles['artist-list']
      case EntityTypeEnum.Playlist:
        return styles['album-list'] // Use album-list styling for playlists
      case EntityTypeEnum.Track:
        return styles['song-list']
      default:
        return styles['album-list']
    }
  }

  return (
    <div className={styles['music-list-section']}>
      <div className={styles['music-list-section-header']}>
        <Typography variant='h2' className='mb-3'>
          {stack.title}
        </Typography>
        {stack.items.length > MAX_ITEMS_TO_SHOW && (
          <button className={styles['show-all-btn']} onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? t('action.showLess') : t('action.showAll')}
          </button>
        )}
      </div>
      <div className={getContentClass()}>{renderContent()}</div>
    </div>
  )
}

export default MusicListSectionComponent
