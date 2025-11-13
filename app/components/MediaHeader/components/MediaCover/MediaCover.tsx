import React from 'react'
import type { EntityTypeEnum } from 'server/db/stack.entity'

import MuzaIcon from '~/icons/MuzaIcon'
import { generatePlaylistCoverImages } from '~/lib/utils'
import type { MusicPlaylist } from '~/store/models'

import styles from './MediaCover.module.css'

interface MediaCoverProps {
  imageSrc: string | string[]
  title: string
  mediaType?: EntityTypeEnum
  size?: 'small' | 'medium' | 'large'
  playlist?: MusicPlaylist
}

const MediaCover: React.FC<MediaCoverProps> = ({
  imageSrc,
  title,
  mediaType = 'album',
  size = 'large',
  playlist,
}) => {
  const renderCoverContent = () => {
    if (mediaType === 'playlist' && playlist) {
      const images = generatePlaylistCoverImages(playlist)

      if (images === null) {
        return (
          <div className={styles['playlist-empty']} data-name='Empty Playlist'>
            <MuzaIcon iconName='playlist' />
          </div>
        )
      }

      return (
        <div className={styles['playlist-collage']} data-name='Playlist Collage'>
          <div
            className={`${styles['collage-item']} ${styles['collage-item--top-left']}`}
            style={{ backgroundImage: `url('${images[0]}')` }}
          />
          <div
            className={`${styles['collage-item']} ${styles['collage-item--top-right']}`}
            style={{ backgroundImage: `url('${images[1]}')` }}
          />
          <div
            className={`${styles['collage-item']} ${styles['collage-item--bottom-left']}`}
            style={{ backgroundImage: `url('${images[2]}')` }}
          />
          <div
            className={`${styles['collage-item']} ${styles['collage-item--bottom-right']}`}
            style={{ backgroundImage: `url('${images[3]}')` }}
          />
        </div>
      )
    }

    if (Array.isArray(imageSrc) && imageSrc.length >= 4) {
      const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right']

      return (
        <div className={styles['playlist-collage']} data-name='Playlist Collage'>
          {imageSrc.slice(0, 4).map((image, index) => (
            <div
              key={index}
              className={`${styles['collage-item']} ${styles[`collage-item--${positions[index]}`]}`}
              style={{ backgroundImage: `url('${image}')` }}
            />
          ))}
        </div>
      )
    }

    const singleImageSrc = Array.isArray(imageSrc)
      ? imageSrc[0] || '/art/imag_1.jpg'
      : imageSrc || '/art/imag_1.jpg'
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
