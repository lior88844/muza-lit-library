import './AlbumPreview.scss'

import React, { useState } from 'react'

import HoverOverlay from '~/components/ui/HoverOverlay'
import MuzaIcon from '~/icons/MuzaIcon'
import { useCurrentPlayerStore } from '~/store/currentPlayerStore'
import type { Album } from '~/store/models'

import AlbumInfoModal from './AlbumInfoModal'

interface AlbumPreviewProps {
  details: Album
  onAlbumClick: () => void
  draggable?: boolean
}

const AlbumPreview: React.FC<AlbumPreviewProps> = ({ details, onAlbumClick, draggable = true }) => {
  const { isPlaying, setIsPlaying } = useCurrentPlayerStore()
  const [isModalOpen, setModalOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsPlaying(!isPlaying)
  }

  const handleDragStart = (e: React.DragEvent) => {
    if (!draggable) return

    setIsDragging(true)

    const dragData = {
      type: 'album',
      album: details,
    }

    e.dataTransfer.setData('application/json', JSON.stringify(dragData))
    e.dataTransfer.effectAllowed = 'copy'
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  return (
    <div
      className={`album-details-card ${draggable ? 'draggable' : ''} ${isDragging ? 'dragging' : ''}`}
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className='image-container' onClick={onAlbumClick}>
        <img src={details.imageSrc || '/art/imag_1.jpg'} alt={details.title} />
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
      <div className='info'>
        <div className='title'>{details.title}</div>
        <div className='artist'>{details.artist}</div>
        <div className='subtitle'>{details.genre && `${details.genre} • `}</div>
        <div className='buttons'>
          <button className='icon-button'>
            <MuzaIcon iconName='dots' />
          </button>
          <button className='icon-button'>
            <MuzaIcon iconName='info' />
          </button>
          <button className='icon-button'>
            <MuzaIcon iconName='plus' />
          </button>
          <button className='icon-button'>
            <MuzaIcon iconName='shuffle' />
          </button>
        </div>
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
