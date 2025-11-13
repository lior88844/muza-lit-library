import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import type { AlbumResponse } from 'server/api/album/types/AlbumResponse'
import { EntityTypeEnum } from 'server/db/stack.entity'

import HoverOverlay from '~/components/ui/HoverOverlay'
import { useDraggable } from '~/lib/hooks/useDraggable'
import { cn } from '~/lib/utils'
import { usePlayerStore } from '~/store/playerStore'

import { Image } from '../ui/image'
import { Typography } from '../ui/typography'
import { AlbumInfoModal } from './album-info-modal'

interface AlbumPreviewProps {
  details: AlbumResponse
  draggable?: boolean
}

const AlbumPreview: React.FC<AlbumPreviewProps> = ({ details, draggable = true }) => {
  const navigate = useNavigate()
  const { currentTrack, isPlaying, playPause, playQueue } = usePlayerStore()
  const [isModalOpen, setModalOpen] = useState(false)

  const { dragHandlers, isDragging } = useDraggable({
    type: EntityTypeEnum.Album,
    data: details,
    enabled: draggable,
  })

  const isCurrentAlbumPlaying = currentTrack?.albumId === details.id && isPlaying

  const handlePlayPause = async (e: React.MouseEvent) => {
    e.stopPropagation()

    if (currentTrack?.albumId === details.id) {
      playPause()
      return
    }

    playQueue({
      items: details.tracks,
      startIndex: 0,
      source: {
        type: EntityTypeEnum.Album,
        id: details.id,
        title: details.title,
      },
    })
  }

  const onAlbumClick = () => {
    navigate(`/albums/${details.id}`)
  }

  return (
    <div
      className={cn(
        'flex flex-col',
        draggable && 'cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-50'
      )}
      {...dragHandlers}
    >
      <div className='relative' onClick={onAlbumClick}>
        <Image
          src={details.coverArt || '/art/imag_1.jpg'}
          alt={details.title}
          className='aspect-square w-full rounded-sm object-cover shadow-md'
        />

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
      <div className='mt-1 max-w-full'>
        <Typography className='truncate font-medium'>{details.title}</Typography>

        <Link to={`/artists/${details.artist.id}`}>
          <Typography className='text-text-muted hover:underline'>{details.artist.name}</Typography>
        </Link>
      </div>
      <AlbumInfoModal album={details} isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}

export default AlbumPreview
