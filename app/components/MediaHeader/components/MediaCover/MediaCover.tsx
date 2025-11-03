import './MediaCover.scss'

import React from 'react'

import type { MediaTypeEnum } from '../../../../../server/db/user-library.entity'

interface MediaCoverProps {
  imageSrc: string | string[] // Can be string for single image or array for playlist collage
  title: string
  mediaType?: MediaTypeEnum
  size?: 'small' | 'medium' | 'large'
}

const MediaCover: React.FC<MediaCoverProps> = ({
  imageSrc,
  title,
  mediaType = 'album',
  size = 'large',
}) => {
  // Generate playlist collage if imageSrc is an array
  const renderCoverContent = () => {
    if (Array.isArray(imageSrc) && imageSrc.length >= 4) {
      const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right']

      return (
        <div className='playlist-collage' data-name='Playlist Collage'>
          {imageSrc.slice(0, 4).map((image, index) => (
            <div
              key={index}
              className={`collage-item collage-item--${positions[index]}`}
              style={{ backgroundImage: `url('${image}')` }}
            />
          ))}
        </div>
      )
    }

    // For single images (albums, artists, or playlists without enough songs)
    const singleImageSrc = Array.isArray(imageSrc) ? imageSrc[0] || '/art/imag_1.jpg' : imageSrc
    return <img src={singleImageSrc} alt={title} />
  }

  return (
    <div
      className={`cover-section cover-section--${size} cover-section--${mediaType}`}
      data-name='cover'
    >
      <div className='cover-frame' data-name='cover frame'>
        {renderCoverContent()}
        <div className='overlay' data-name='Overlay' />
      </div>
    </div>
  )
}

export default MediaCover
