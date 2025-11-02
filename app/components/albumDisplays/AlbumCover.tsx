import './AlbumCover.scss'

import React, { useState } from 'react'

import HoverOverlay from '~/components/ui/HoverOverlay'
import type { Album } from '~/store/models'

interface AlbumCoverProps {
  imageSrc: string
  title: string
  subTitle: string
  onAlbumSelect?: (data: { title: string; subTitle: string; imageSrc: string }) => void
  albumDetails?: Album
  draggable?: boolean
}

const AlbumCover: React.FC<AlbumCoverProps> = ({
  imageSrc,
  title,
  subTitle,
  onAlbumSelect,
  albumDetails,
  draggable = true,
}) => {
  const [isDragging, setIsDragging] = useState(false)

  const handleClick = () => {
    if (onAlbumSelect) {
      onAlbumSelect({ title, subTitle, imageSrc })
    }
  }

  const handleDragStart = (e: React.DragEvent) => {
    if (!draggable || !albumDetails) return

    setIsDragging(true)

    const dragData = {
      type: 'album',
      album: albumDetails,
    }

    e.dataTransfer.setData('application/json', JSON.stringify(dragData))
    e.dataTransfer.effectAllowed = 'copy'
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  return (
    <div
      className={`album-cover ${draggable ? 'draggable' : ''} ${isDragging ? 'dragging' : ''}`}
      onClick={handleClick}
      draggable={draggable && !!albumDetails}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className='image-container'>
        <img src={imageSrc || '/art/imag_1.jpg'} alt={title} />
        <HoverOverlay
          showPlayButton={true}
          onPlayPause={e => {
            e.stopPropagation()
            handleClick()
          }}
        />
      </div>
      <h3 dangerouslySetInnerHTML={{ __html: title }} />
      <p>{subTitle}</p>
    </div>
  )
}

export default AlbumCover
