import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import type { MiniAlbum } from 'server/api/album/types/MiniAlbumResponse'
import { EntityTypeEnum } from 'server/db/stack.entity'

import HoverOverlay from '~/components/ui/HoverOverlay'
import { useDraggable } from '~/lib/hooks/useDraggable'
import useFetcherAsync from '~/lib/useFetcherAsync'
import { cn } from '~/lib/utils'
import { usePlayerStore } from '~/store/playerStore'
import type { QueueItem } from '~/types/player'

import { Image } from '../ui/image'
import { Typography } from '../ui/typography'
import { AlbumInfoModal } from './album-info-modal'

interface AlbumPreviewProps {
  details: MiniAlbum
  draggable?: boolean
}

interface AlbumLoaderData {
  album: {
    id: number
    title: string
    tracks: Array<Record<string, unknown>>
    [key: string]: unknown
  }
}

const AlbumPreview: React.FC<AlbumPreviewProps> = ({ details, draggable = true }) => {
  const navigate = useNavigate()
  const { current, isPlaying, playPause, playQueue } = usePlayerStore()
  const [isModalOpen, setModalOpen] = useState(false)

  const fetcher = useFetcherAsync<AlbumLoaderData>()
  const { dragHandlers, isDragging } = useDraggable({
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

    try {
      // Fetch the album data and wait for it
      const data = await fetcher.load(`/albums/${details.id}`)
      const albumData = data.album

      // Add album property to each track for the queue
      const tracksWithAlbum = albumData.tracks.map(track => ({
        ...track,
        album: albumData.title,
        albumId: albumData.id,
      })) as QueueItem[]
      
      playQueue({
        items: tracksWithAlbum,
        startIndex: 0,
        source: {
          type: 'album',
          id: albumData.id,
          title: albumData.title,
        },
      })
    } catch (error) {
      console.error('Failed to load album:', error)
    }
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
