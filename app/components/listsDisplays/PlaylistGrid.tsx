import React from 'react'
import { useTranslation } from 'react-i18next'

import { generatePlaylistCoverImages } from '~/lib/utils'

import PlaylistCover from '../albumDisplays/PlaylistCover'
import CreatePlaylistCard from './CreatePlaylistCard'
import styles from './PlaylistGrid.module.css'

interface PlaylistGridProps {
  // TODO: provide proper type for playlists
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  playlists: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onPlaylistClick: (playlist: any) => void
  onCreatePlaylist: () => void
}

const PlaylistGrid: React.FC<PlaylistGridProps> = ({
  playlists,
  onPlaylistClick,
  onCreatePlaylist,
}) => {
  const { t } = useTranslation()

  return (
    <div className={styles.playlistGrid}>
      <CreatePlaylistCard onClick={onCreatePlaylist} />

      {playlists.map((playlist, index) => (
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
