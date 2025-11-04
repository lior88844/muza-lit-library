import React from 'react'

import type { MediaTypeEnum } from '../../../../../server/db/user-library.entity'
import styles from './MediaCover.module.css'

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
      return (
        <div className={styles['playlist-collage']} data-name='Playlist Collage'>
          <div
            className={`${styles['collage-item']} ${styles['collage-item--top-left']}`}
            style={{ backgroundImage: `url('${imageSrc[0]}')` }}
          />
          <div
            className={`${styles['collage-item']} ${styles['collage-item--top-right']}`}
            style={{ backgroundImage: `url('${imageSrc[1]}')` }}
          />
          <div
            className={`${styles['collage-item']} ${styles['collage-item--bottom-left']}`}
            style={{ backgroundImage: `url('${imageSrc[2]}')` }}
          />
          <div
            className={`${styles['collage-item']} ${styles['collage-item--bottom-right']}`}
            style={{ backgroundImage: `url('${imageSrc[3]}')` }}
          />
        </div>
      )
    }

    // For single images (albums, artists, or playlists without enough songs)
    const singleImageSrc = Array.isArray(imageSrc) ? imageSrc[0] || '/art/imag_1.jpg' : imageSrc
    return <img src={singleImageSrc} alt={title} />
  }

  return (
    <div
      className={`${styles['cover-section']} ${styles[`cover-section--${size}`]} ${styles[`cover-section--${mediaType}`]}`}
      data-name='cover'
    >
      <div className={styles['cover-frame']} data-name='cover frame'>
        {renderCoverContent()}
        <div className={styles.overlay} data-name='Overlay' />
      </div>
    </div>
  )
}

export default MediaCover
