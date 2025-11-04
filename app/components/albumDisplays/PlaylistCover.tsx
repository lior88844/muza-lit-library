import React from 'react'

import type { DropdownMenuItem } from '~/components/ui/DropdownMenu'
import DropdownMenu from '~/components/ui/DropdownMenu'
import HoverOverlay from '~/components/ui/HoverOverlay'
import MuzaIcon from '~/icons/MuzaIcon'
import { useCurrentPlayerStore } from '~/store/currentPlayerStore'
import type { MusicPlaylist } from '~/store/models'

import hoverOverlayStyles from '../ui/HoverOverlay.module.css'
import styles from './PlaylistCover.module.css'

interface PlaylistCoverProps {
  albumImages: string[]
  title: string
  songsCount: string
  userName: string
  playlist?: MusicPlaylist
  onSelect?: (data: {
    title: string
    songsCount: string
    albumImages: string[]
    userName: string
  }) => void
}

const PlaylistCover: React.FC<PlaylistCoverProps> = ({
  albumImages,
  title,
  songsCount,
  userName,
  playlist,
  onSelect,
}) => {
  const { setSelectedSong, setIsPlaying } = useCurrentPlayerStore()

  const handleClick = () => {
    onSelect?.({ title, songsCount, albumImages, userName })
  }

  const handlePlayPlaylist = () => {
    if (playlist && playlist.songs && playlist.songs.length > 0) {
      setSelectedSong(playlist.songs[0])
      setIsPlaying(true)
    }
  }

  const handleShare = () => {
    // TODO: Implement share functionality
  }

  const handleRemoveFromLibrary = () => {
    // TODO: Implement remove from library functionality
  }

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

  // Ensure we have 4 images, pad with first image if needed
  const safeAlbumImages = Array.isArray(albumImages) ? albumImages : []
  const paddedImages = [...safeAlbumImages]
  while (paddedImages.length < 4) {
    paddedImages.push(paddedImages[0] || '')
  }

  return (
    <div className={styles.playlistCover} onClick={handleClick}>
      <div className={styles.playlistCoverImageContainer}>
        <div className={styles.playlistCoverCollage}>
          <div
            className={`${styles.playlistCoverImage} ${styles.playlistCoverImageTopLeft}`}
            style={{ backgroundImage: `url('${paddedImages[0]}')` }}
          />
          <div
            className={`${styles.playlistCoverImage} ${styles.playlistCoverImageTopRight}`}
            style={{ backgroundImage: `url('${paddedImages[1]}')` }}
          />
          <div
            className={`${styles.playlistCoverImage} ${styles.playlistCoverImageBottomLeft}`}
            style={{ backgroundImage: `url('${paddedImages[2]}')` }}
          />
          <div
            className={`${styles.playlistCoverImage} ${styles.playlistCoverImageBottomRight}`}
            style={{ backgroundImage: `url('${paddedImages[3]}')` }}
          />
        </div>
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
        <div className={styles.playlistCoverTitle}>{title}</div>
        <div className={styles.playlistCoverDetails}>
          <span className={styles.playlistCoverSongsCount}>{songsCount} Songs</span>
          <span className={styles.playlistCoverSeparator}>•</span>
          <span className={styles.playlistCoverUserName}>{userName}</span>
        </div>
      </div>
    </div>
  )
}

export default PlaylistCover
