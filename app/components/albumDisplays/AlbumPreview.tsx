import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import type { MiniAlbum } from 'server/api/album/types/MiniAlbumResponse'
import { EntityTypeEnum } from 'server/db/stack.entity'

import HoverOverlay from '~/components/ui/HoverOverlay'
import { useDraggable } from '~/lib/hooks/useDraggable'
import { usePlayerStore } from '~/store/playerStore'

import { Image } from '../ui/image'
import AlbumInfoModal from './AlbumInfoModal'
import styles from './AlbumPreview.module.css'

interface AlbumPreviewProps {
  details: MiniAlbum
  draggable?: boolean
}

const AlbumPreview: React.FC<AlbumPreviewProps> = ({ details, draggable = true }) => {
  const navigate = useNavigate()
  const { isPlaying, setIsPlaying } = usePlayerStore()
  const [isModalOpen, setModalOpen] = useState(false)
  const { dragHandlers } = useDraggable({
    type: EntityTypeEnum.Album,
    data: details,
    enabled: draggable,
  })

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsPlaying(!isPlaying)
  }
  const onAlbumClick = () => {
    navigate(`/albums/${details.id}`)
  }

  return (
    <div className={styles['album-details-card']} {...dragHandlers}>
      <div className={styles['image-container']} onClick={onAlbumClick}>
        <Image src={details.imageSrc || '/art/imag_1.jpg'} alt={details.title} />
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
        <Link to={`/artists/${details.artistId}`} className='text-text-secondary hover:underline'>
          {details.artist}
        </Link>
        {/* <div className={styles.subtitle}>{details.genre && `${details.genre} • `}</div> */}
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
