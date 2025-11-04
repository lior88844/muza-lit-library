import React, { useState } from 'react'

import HoverOverlay from '~/components/ui/HoverOverlay'
import { useCurrentPlayerStore } from '~/store/currentPlayerStore'
import type { Album } from '~/store/models'

import { Image } from '../ui/image'
import AlbumInfoModal from './AlbumInfoModal'
import styles from './AlbumPreview.module.css'

interface AlbumPreviewProps {
  details: Album
  onAlbumClick: () => void
}

const AlbumPreview: React.FC<AlbumPreviewProps> = ({ details, onAlbumClick }) => {
  const { isPlaying, setIsPlaying } = useCurrentPlayerStore()
  const [isModalOpen, setModalOpen] = useState(false)

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsPlaying(!isPlaying)
  }

  return (
    <div className={styles['album-details-card']}>
      <div className={styles['image-container']} onClick={onAlbumClick}>
        <Image src={details.imageSrc} alt={details.title} />
        <HoverOverlay
          isPlaying={!!isPlaying}
          onPlayPause={handlePlayPause}
          actions={[
            {
              icon: 'ellipsis',
              onClick: e => e.stopPropagation(),
              title: 'More options',
            },
          ]}
        />
      </div>
      <div className={styles.info}>
        <div className={styles.title}>{details.title}</div>
        <div className={styles.artist}>{details.artist}</div>
        <div className={styles.subtitle}>{details.genre && `${details.genre} • `}</div>
      </div>
      <AlbumInfoModal
        // @ts-expect-error TODO: We need to get all album data always, somehow.
        album={details}
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  )
}

export default AlbumPreview
