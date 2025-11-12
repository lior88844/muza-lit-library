import React from 'react'
import { FaEllipsisV, FaPencilAlt } from 'react-icons/fa'
import { useNavigate } from 'react-router'
import { EntityTypeEnum } from 'server/db/stack.entity'

import MediaHeader from '~/components/MediaHeader/MediaHeader'
import SongLineWithCover from '~/components/songLineDisplays/SongLineWithCover'
import { useDrawerStore } from '~/store/drawerStore'
import type { MusicPlaylist, SongDetails } from '~/store/models'
import { usePlayerStore } from '~/store/playerStore'

import type { PlaylistVisibilityEnum } from '../../../server/db/playlist.entity'
import { Button, IconButton } from '../ui/button'
import styles from './PlaylistDetail.module.css'

interface PlaylistDetailProps {
  playlist: MusicPlaylist
}

const PlaylistDetail: React.FC<PlaylistDetailProps> = ({ playlist }) => {
  const navigate = useNavigate()
  const {
    current,
    playQueue,
    isPlaying,
    playPause,
  } = usePlayerStore()
  const { openPlaylistDrawer, isPlaylistDrawerOpen } = useDrawerStore()

  // Use the actual playlist songs
  const playlistSongs = playlist?.songs || []

  const handleSongClick = (song: SongDetails, index: number) => {
    if (current?.id === song.id) {
      // If the same song is clicked, toggle play/pause
      playPause()
    } else {
      // If a different song is clicked, load playlist as queue
      playQueue({
        items: playlistSongs,
        startIndex: index,
        source: {
          type: 'playlist',
          id: playlist.id,
          title: playlist.title,
        },
      })
    }
  }

  const isCurrentSongPlaying = (song: SongDetails) => {
    return current?.id === song.id && !!isPlaying
  }

  const handleEditClick = () => {
    openPlaylistDrawer(playlist?.id)
  }

  const handleBackClick = () => {
    navigate('/playlists')
  }

  return (
    <div className={styles['playlist-detail']}>
      <div className={styles['playlist-detail__container']}>
        <MediaHeader
          songs={playlistSongs}
          mediaType={EntityTypeEnum.Playlist}
          title={playlist.title}
          imageSrc={playlist.imageSrc || ''}
          mediaMetadata={{
            songCount: playlistSongs.length,
          }}
          entityId={playlist.id}
          visibility={playlist.visibility as PlaylistVisibilityEnum}
          creator={playlist.author}
          showBackButton={true}
          playlist={playlist}
          onBackClick={handleBackClick}
          customActions={
            <div className={styles['playlist-actions']}>
              <IconButton variant='secondary' icon={<FaEllipsisV />} data-name='Menu Button' />

              <Button
                variant='secondary'
                iconStart={<FaPencilAlt />}
                data-name='Edit Button'
                onClick={handleEditClick}
              >
                Edit
              </Button>
            </div>
          }
        />

        <div className={styles['playlist-detail__song-list']} data-name='Song List'>
          {playlistSongs.map((song, index) => {
            // Show preview badge for first, fourth, sixth, seventh and eighth songs per Figma
            const showPreview = [3].includes(index)

            return (
              <div
                key={song.id}
                className={`${styles['playlist-detail__song-item']} ${isCurrentSongPlaying(song) ? styles.playing : ''}`}
              >
                <SongLineWithCover
                  details={{ ...song, index: index + 1 }}
                  onClick={() => handleSongClick(song, index)}
                  isPlaying={isCurrentSongPlaying(song)}
                  showPreview={showPreview}
                  showHoverActions={true}
                  draggable={isPlaylistDrawerOpen}
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default PlaylistDetail
