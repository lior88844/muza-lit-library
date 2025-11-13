import React from 'react'
import { useTranslation } from 'react-i18next'
import { EntityTypeEnum } from 'server/db/stack.entity'

import type { DropdownMenuItem } from '~/components/ui/DropdownMenu'
import DropdownMenu from '~/components/ui/DropdownMenu'
import HoverOverlay from '~/components/ui/HoverOverlay'
import MuzaIcon from '~/icons/MuzaIcon'
import { useDraggable } from '~/lib/hooks/useDraggable'
import { cn } from '~/lib/utils'
import type { MusicPlaylist } from '~/store/models'
import { usePlayerStore } from '~/store/playerStore'

import hoverOverlayStyles from '../ui/HoverOverlay.module.css'
import styles from './PlaylistCover.module.css'
import { PlaylistImgPreview } from './PlaylistImgPreview'

interface PlaylistCoverProps {
  playlist: MusicPlaylist
  draggable?: boolean
  onSelect?: (playlist: MusicPlaylist) => void
}

const PlaylistCover: React.FC<PlaylistCoverProps> = ({ playlist, draggable, onSelect }) => {
  const { setSelectedSong, setIsPlaying } = usePlayerStore()
  const { t } = useTranslation()
  const { dragHandlers, isDragging } = useDraggable({
    type: EntityTypeEnum.Playlist,
    data: playlist,
    enabled: !!draggable && !!playlist,
  })

  const handleClick = () => {
    onSelect?.(playlist)
  }

  const handlePlayPlaylist = () => {
    if (playlist && playlist.songs && playlist.songs.length > 0) {
      setSelectedSong(playlist.songs[0])
      setIsPlaying(true)
    }
  }

  const handleShare = () => {}

  const handleRemoveFromLibrary = () => {}

  const dropdownMenuItems: DropdownMenuItem[] = [
    {
      id: 'share',
      title: 'Share',
      icon: 'share',
      onClick: handleShare,
    },
    {
      id: 'remove-from-library',
      title: 'Remove from library',
      icon: 'minus',
      onClick: handleRemoveFromLibrary,
    },
  ]

  const isEmpty = playlist.songs.length === 0

  return (
    <div
      className={cn(
        styles.playlistCover,
        draggable && 'cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-50'
      )}
      onClick={handleClick}
      {...dragHandlers}
    >
      <div className={styles.playlistCoverImageContainer}>
        {isEmpty ? (
          <div className={styles.playlistCoverEmpty}>
            <MuzaIcon iconName='playlist' />
          </div>
        ) : (
          <PlaylistImgPreview playlist={playlist!} />
        )}
        <HoverOverlay
          showPlayButton={true}
          onPlayPause={e => {
            e.stopPropagation()
            handlePlayPlaylist()
          }}
          actions={[
            {
              icon: 'ellipsis',
              onClick: e => e.stopPropagation(),
              title: 'More options',
              customComponent: (
                <DropdownMenu
                  trigger={
                    <button
                      className={hoverOverlayStyles.hoverOverlayBtn}
                      onClick={e => e.stopPropagation()}
                      title='More options'
                    >
                      <MuzaIcon iconName='ellipsis' />
                    </button>
                  }
                  items={dropdownMenuItems}
                />
              ),
            },
          ]}
        />
      </div>
      <div className={styles.playlistCoverInfo}>
        <div className={styles.playlistCoverTitle}>{playlist.title}</div>
        <div className={styles.playlistCoverDetails}>
          <span className={styles.playlistCoverSongsCount}>{playlist.songs.length} Songs</span>
          <span className={styles.playlistCoverSeparator}>•</span>
          <span className={styles.playlistCoverUserName}>
            {playlist.author || t('common.unknown')}
          </span>
        </div>
      </div>
    </div>
  )
}

export default PlaylistCover
