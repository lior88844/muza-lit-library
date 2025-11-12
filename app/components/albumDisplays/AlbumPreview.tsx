import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import type { MiniAlbum } from 'server/api/album/types/MiniAlbumResponse'
import { EntityTypeEnum } from 'server/db/stack.entity'

import HoverOverlay from '~/components/ui/HoverOverlay'
import { useDraggable } from '~/lib/hooks/useDraggable'
import { cn } from '~/lib/utils'
import { useCurrentPlayerStore } from '~/store/currentPlayerStore'

import { Image } from '../ui/image'
import { Typography } from '../ui/typography'
import { AlbumInfoModal } from './album-info-modal'

interface AlbumPreviewProps {
  details: MiniAlbum
  draggable?: boolean
}

const AlbumPreview: React.FC<AlbumPreviewProps> = ({ details, draggable = true }) => {
  const navigate = useNavigate()
  const { isPlaying, setIsPlaying } = useCurrentPlayerStore()
  const [isModalOpen, setModalOpen] = useState(false)

  const { dragHandlers, isDragging } = useDraggable({
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
          src={details.imageSrc || '/art/imag_1.jpg'}
          alt={details.title}
          className='aspect-square w-full rounded-sm object-cover shadow-md'
        />

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
      <div className='mt-1 max-w-full'>
        <Typography className='truncate font-medium'>{details.title}</Typography>

        <Link to={`/artists/${details.artistId}`}>
          <Typography className='text-text-muted hover:underline'>{details.artist}</Typography>
        </Link>
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
