import './PlaylistDetail.scss'

import React from 'react'

import MediaHeader from '~/components/MediaHeader/MediaHeader'
import SongLineWithCover from '~/components/songLineDisplays/SongLineWithCover'
import MuzaButton from '~/controls/MuzaButton'
import { useCurrentPlayerStore } from '~/store/currentPlayerStore'
import type { MusicPlaylist, SongDetails } from '~/store/models'

import type { PlaylistVisibilityEnum } from '../../../server/db/playlist.entity'
import { MediaTypeEnum } from '../../../server/db/user-library.entity'

interface PlaylistDetailProps {
  playlist: MusicPlaylist
}

const PlaylistDetail: React.FC<PlaylistDetailProps> = ({ playlist }) => {
  const { selectedSong, setSelectedSong, isPlaying, setIsPlaying, togglePlayPause, openPlaylistDrawer } = useCurrentPlayerStore()

  // Use the actual playlist songs
  const playlistSongs = playlist?.songs || []

  const handleSongClick = (song: SongDetails) => {
    if (selectedSong?.id === song.id) {
      // If the same song is clicked, toggle play/pause
      togglePlayPause()
    } else {
      // If a different song is clicked, select it and start playing
      setSelectedSong(song)
      setIsPlaying(true)
    }
  }

  const isCurrentSongPlaying = (song: SongDetails) => {
    return selectedSong?.id === song.id && !!isPlaying
  }

  const handleEditClick = () => {
    openPlaylistDrawer(playlist?.id)
  }

  return (
    <div className='playlist-detail'>
      <div className='playlist-detail__container'>
        <MediaHeader
          songs={playlistSongs}
          mediaType={MediaTypeEnum.Playlist}
          title={playlist.title}
          imageSrc={playlist.imageSrc || ''}
          mediaMetadata={{
            songCount: playlistSongs.length,
          }}
          resourceId={playlist.id}
          visibility={playlist.visibility as PlaylistVisibilityEnum}
          creator={playlist.author}
          showBackButton={true}
          customActions={
            <div className='playlist-actions'>
              <MuzaButton iconName='ellipsis' onClick={() => {}} size='medium' data-name='Menu Button' />
              <MuzaButton iconName='pencil' onClick={handleEditClick} size='medium' data-name='Edit Button' content='Edit' />
            </div>
          }
        />

        <div className='playlist-detail__song-list' data-name='Song List'>
          {playlistSongs.map((song, index) => {
            // Show preview badge for first, fourth, sixth, seventh and eighth songs per Figma
            const showPreview = [3].includes(index)

            return (
              <div key={song.id} className={`playlist-detail__song-item ${isCurrentSongPlaying(song) ? 'playing' : ''}`}>
                <SongLineWithCover
                  details={{ ...song, index: index + 1 }}
                  onClick={() => handleSongClick(song)}
                  isPlaying={isCurrentSongPlaying(song)}
                  showPreview={showPreview}
                  showHoverActions={true}
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
