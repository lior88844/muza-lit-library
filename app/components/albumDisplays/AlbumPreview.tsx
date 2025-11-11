import React, { useState } from 'react'
import { Link, useFetcher, useNavigate } from 'react-router'
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
  const { current, isPlaying, playPause, playQueue } = usePlayerStore()
  const [isModalOpen, setModalOpen] = useState(false)
  const fetcher = useFetcher()
  const { dragHandlers } = useDraggable({
    type: EntityTypeEnum.Album,
    data: details,
    enabled: draggable,
  })

  // Check if this album is currently playing
  const isCurrentAlbumPlaying = 
    current?.albumId === details.id && isPlaying

  const handlePlayPause = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    // If this album is already playing, just toggle play/pause
    if (current?.albumId === details.id) {
      playPause()
      return
    }

    // Otherwise, fetch the album data and load it into the queue
    fetcher.load(`/albums/${details.id}`)
  }

  // When fetcher loads album data, start playing it
  React.useEffect(() => {
    if (fetcher.data && fetcher.state === 'idle') {
      const albumData = fetcher.data.album
      if (albumData && albumData.tracks) {
        // Add album property to each track for the queue
        const tracksWithAlbum = albumData.tracks.map((track: any) => ({
          ...track,
          album: albumData.title,
          albumId: albumData.id,
        }))
        
        playQueue({
          items: tracksWithAlbum,
          startIndex: 0,
          source: {
            type: 'album',
            id: albumData.id,
            title: albumData.title,
          },
        })
      }
    }
  }, [fetcher.data, fetcher.state, playQueue])
  const onAlbumClick = () => {
    navigate(`/albums/${details.id}`)
  }

  return (
    <div className={styles['album-details-card']} {...dragHandlers}>
      <div className={styles['image-container']} onClick={onAlbumClick}>
        <Image src={details.imageSrc || '/art/imag_1.jpg'} alt={details.title} />
        <HoverOverlay
          isPlaying={isCurrentAlbumPlaying}
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
