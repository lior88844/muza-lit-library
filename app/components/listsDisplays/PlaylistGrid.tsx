import './PlaylistGrid.scss'

import React from 'react'

import { useTranslation } from '~/lib/i18n/translations'
import { generatePlaylistCoverImages } from '~/lib/utils'

import PlaylistCover from '../albumDisplays/PlaylistCover'
import CreatePlaylistCard from './CreatePlaylistCard'

interface PlaylistGridProps {
  playlists: any[]
  onPlaylistClick: (playlist: any) => void
  onCreatePlaylist: () => void
}

const PlaylistGrid: React.FC<PlaylistGridProps> = ({ playlists, onPlaylistClick, onCreatePlaylist }) => {
  const { t } = useTranslation()

  // Filter out playlists with no songs
  const playlistsWithSongs = playlists.filter(playlist => playlist.songs && playlist.songs.length > 0)

  return (
    <div className='playlist-grid'>
      <CreatePlaylistCard onClick={onCreatePlaylist} />

      {playlistsWithSongs.map((playlist, index) => (
        <PlaylistCover
          key={playlist.id || index}
          albumImages={generatePlaylistCoverImages(playlist)}
          title={playlist.title || playlist.name}
          songsCount={playlist.songs?.length?.toString() || '0'}
          userName={playlist.userName || playlist.author || t('common.unknown')}
          playlist={playlist}
          onSelect={() => onPlaylistClick(playlist)}
        />
      ))}
    </div>
  )
}

export default PlaylistGrid
