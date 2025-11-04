import './AlbumCover.scss'

import React from 'react'

import HoverOverlay from '~/components/ui/HoverOverlay'
import { useDraggable } from '~/lib/hooks/useDraggable'
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
  const { isDragging, dragHandlers } = useDraggable({
    type: 'album',
    data: albumDetails,
    enabled: draggable && !!albumDetails,
  })

  const handleClick = () => {
    if (onAlbumSelect) {
      onAlbumSelect({ title, subTitle, imageSrc })
    }
  }

  return (
    <div
      className={`album-cover ${draggable ? 'draggable' : ''} ${isDragging ? 'dragging' : ''}`}
      onClick={handleClick}
      {...dragHandlers}
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
