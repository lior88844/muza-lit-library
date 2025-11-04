import React from 'react'

import { useTranslation } from '~/lib/i18n/translations'
import { useCurrentPlayerStore } from '~/store/currentPlayerStore'
import type { Album, Artist, MusicListSection, SongDetails } from '~/store/models'

import AlbumPreview from '../albumDisplays/AlbumPreview'
import PlaylistCover from '../albumDisplays/PlaylistCover'
import ArtistPreview from '../artistDisplays/ArtistPreview'
import SongLineWithCover from '../songLineDisplays/SongLineWithCover'
import { Typography } from '../ui/typography'
import styles from './MusicListSection.module.css'

const MusicListSectionComponent: React.FC<
  MusicListSection & {
    onAlbumClick?: (album: Album) => void
    albums?: Album[]
    songs?: SongDetails[]
    artists?: Artist[]
  }
> = ({
  title,
  subTitle,
  type,
  list,
  onShowAll,
  onAlbumClick,
  albums,
  songs,
  artists,
}) => {
  const { t } = useTranslation()
  const {
    selectedSong: globalSelectedSong,
    setSelectedSong,
    setIsPlaying,
    isPlaying,
    togglePlayPause,
    isPlaylistDrawerOpen,
  } = useCurrentPlayerStore()

  const handleShowAll = () => {
    if (onShowAll) {
      onShowAll(title)
    }
  }

  const renderContent = () => {
    switch (type) {
      case 'album':
        return albums!.map(album => (
          <AlbumPreview key={album.id} details={album} onAlbumClick={() => onAlbumClick?.(album)} />
        ))
      case 'artist':
        return artists!.map(artist => (
          <ArtistPreview
            key={artist.id}
            details={{
              id: parseInt(artist.id.toString()),
              imageUrl: artist.imageUrl || '',
              name: artist.name,
              albumsCount: artist.albumsCount,
            }}
          />
        ))
      case 'playlist':
        return list.map((item, idx) => (
          <PlaylistCover
            key={idx}
            albumImages={[item.imageSrc || '']}
            title={item.title}
            songsCount={item.songsCount?.toString() || ''}
            userName={item.author || t('common.unknown')}
          />
        ))
      case 'song':
        return songs!.map(song => (
          <SongLineWithCover
            key={song.id}
            details={song}
            onClick={() => {
              if (globalSelectedSong?.id === song.id) {
                togglePlayPause()
              } else {
                setSelectedSong(song)
                setIsPlaying(true)
              }
            }}
            isPlaying={song.id === globalSelectedSong?.id && !!isPlaying}
            draggable={isPlaylistDrawerOpen}
          />
        ))
      default:
        return null
    }
  }

  // Determine the appropriate CSS class based on type
  const getContentClass = () => {
    switch (type) {
      case 'album':
        return styles['album-list']
      case 'artist':
        return styles['artist-list']
      case 'playlist':
        return styles['album-list'] // Use album-list styling for playlists
      case 'song':
        return styles['song-list']
      default:
        return styles['album-list']
    }
  }

  return (
    <div className={styles['music-list-section']}>
      <div className={styles['music-list-section-header']}>
        <Typography variant='h2' className='mb-3'>
          {title}
        </Typography>
        <button className={styles['show-all-btn']} onClick={handleShowAll}>
          {t('action.showAll')}
        </button>
      </div>
      {subTitle && <p>{subTitle}</p>}
      <div className={getContentClass()}>{renderContent()}</div>
    </div>
  )
}

export default MusicListSectionComponent
