import React from 'react'

import { useDrawerStore } from '~/store/drawerStore'

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
  const { isStackDrawerOpen } = useDrawerStore()
  return (
    <div className={styles.playlistGrid}>
      <CreatePlaylistCard onClick={onCreatePlaylist} />

      {playlists.map((playlist, index) => (
        <PlaylistCover
          draggable={isStackDrawerOpen}
          key={playlist.id || index}
          playlist={playlist}
          onSelect={() => onPlaylistClick(playlist)}
        />
      ))}
    </div>
  )
}

export default PlaylistGrid
