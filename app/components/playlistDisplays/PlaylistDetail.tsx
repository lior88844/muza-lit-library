import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import type { TrackResponse } from 'server/api/track/types/TrackResponse'
import { EntityTypeEnum } from 'server/db/stack.entity'

import MediaHeader from '~/components/MediaHeader/MediaHeader'
import TrackPreview from '~/components/songLineDisplays/TrackPreview'
import MuzaIcon from '~/icons/MuzaIcon'
import { useDrawerStore } from '~/store/drawerStore'
import { useRemovePlaylist } from '~/store/media/useRemovePlaylist'
import { useUpdatePlaylist } from '~/store/media/useUpdatePlaylist'
import type { MusicPlaylist } from '~/store/models'
import { usePlayerStore } from '~/store/playerStore'

import { PlaylistVisibilityEnum } from '../../../server/db/playlist.entity'
import { Button } from '../ui/button'
import DropdownMenu, { type DropdownMenuItem } from '../ui/DropdownMenu'
import styles from './PlaylistDetail.module.css'

interface PlaylistDetailProps {
  playlist: MusicPlaylist
}

const PlaylistDetail: React.FC<PlaylistDetailProps> = ({ playlist }) => {
  const navigate = useNavigate()
  const { currentTrack: current, playQueue, isPlaying, playPause } = usePlayerStore()
  const { openPlaylistDrawer, isPlaylistDrawerOpen } = useDrawerStore()
  const { removePlaylist } = useRemovePlaylist()
  const { updatePlaylist } = useUpdatePlaylist()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const playlistSongs = playlist?.songs || []
  const handleSongClick = (song: TrackResponse, index: number) => {
    if (current?.id === song.id) {
      playPause()
    } else {
      playQueue({
        items: playlistSongs,
        startIndex: index,
        source: {
          type: EntityTypeEnum.Playlist,
          id: playlist.id,
          title: playlist.title,
        },
      })
    }
  }

  const isCurrentSongPlaying = (song: TrackResponse) => {
    return current?.id === song.id && !!isPlaying
  }

  const handleEditClick = () => {
    openPlaylistDrawer(playlist?.id)
  }

  const handleMakePrivate = async () => {
    const newVisibility =
      playlist.visibility === PlaylistVisibilityEnum.Public
        ? PlaylistVisibilityEnum.Private
        : PlaylistVisibilityEnum.Public
    await updatePlaylist(playlist.id, { visibility: newVisibility })
  }

  const handleDeletePlaylist = async () => {
    const result = await removePlaylist(playlist.id)
    if (result && 'success' in result && result.success) {
      navigate('/playlists')
    }
  }

  const handleBackClick = () => {
    navigate('/playlists')
  }

  const handleRemoveSongFromPlaylist = (songId: number) => {
    updatePlaylist(playlist.id, {
      songs: playlistSongs.filter(song => song.id !== songId),
    })
  }

  // Build dropdown menu items
  const menuItems: DropdownMenuItem[] = [
    {
      id: 'edit',
      title: 'Edit',
      icon: 'pencil',
      onClick: handleEditClick,
    },
    {
      id: 'make-private',
      title: playlist.visibility === PlaylistVisibilityEnum.Public ? 'Make private' : 'Make public',
      icon: 'lock',
      onClick: handleMakePrivate,
    },
    {
      id: 'delete-playlist',
      title: 'Delete playlist',
      icon: 'trash',
      onClick: handleDeletePlaylist,
      destructive: true,
    },
  ]

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
              <DropdownMenu
                open={isDropdownOpen}
                onOpenChange={setIsDropdownOpen}
                trigger={
                  <Button
                    variant='secondary'
                    size='icon'
                    data-name='Menu Button'
                    onClick={e => {
                      e.stopPropagation()
                    }}
                  >
                    <MuzaIcon iconName='ellipsis' />
                  </Button>
                }
                items={menuItems}
              />
            </div>
          }
        />

        <div className={styles['playlist-detail__song-list']} data-name='Song List'>
          {playlistSongs.map((song, index) => {
            return (
              <div
                key={song.id}
                className={`${styles['playlist-detail__song-item']} ${isCurrentSongPlaying(song) ? styles.playing : ''}`}
              >
                <TrackPreview
                  track={song}
                  onClick={() => handleSongClick(song, index)}
                  showHoverActions={true}
                  draggable={isPlaylistDrawerOpen}
                  onRemoveSong={() => handleRemoveSongFromPlaylist(song.id)}
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
