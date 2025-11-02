import './MediaCover.scss'

import React from 'react'

import { generatePlaylistCoverImages } from '~/lib/utils'
import type { MusicPlaylist } from '~/store/models'

import type { MediaTypeEnum } from '../../../../../server/db/user-library.entity'

interface MediaCoverProps {
  imageSrc: string | string[] // Can be string for single image or array for playlist collage
  title: string
  mediaType?: MediaTypeEnum
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
  // Generate playlist collage
  const renderCoverContent = () => {
    // For playlists, generate cover from songs
    if (mediaType === 'playlist' && playlist) {
      const images = generatePlaylistCoverImages(playlist)
      return (
        <div className='playlist-collage' data-name='Playlist Collage'>
          <div
            className='collage-item collage-item--top-left'
            style={{ backgroundImage: `url('${images[0]}')` }}
          />
          <div
            className='collage-item collage-item--top-right'
            style={{ backgroundImage: `url('${images[1]}')` }}
          />
          <div
            className='collage-item collage-item--bottom-left'
            style={{ backgroundImage: `url('${images[2]}')` }}
          />
          <div
            className='collage-item collage-item--bottom-right'
            style={{ backgroundImage: `url('${images[3]}')` }}
          />
        </div>
      )
    }

    // Legacy: For array format (backwards compatibility)
    if (Array.isArray(imageSrc) && imageSrc.length >= 4) {
      return (
        <div className='playlist-collage' data-name='Playlist Collage'>
          <div
            className='collage-item collage-item--top-left'
            style={{ backgroundImage: `url('${imageSrc[0]}')` }}
          />
          <div
            className='collage-item collage-item--top-right'
            style={{ backgroundImage: `url('${imageSrc[1]}')` }}
          />
          <div
            className='collage-item collage-item--bottom-left'
            style={{ backgroundImage: `url('${imageSrc[2]}')` }}
          />
          <div
            className='collage-item collage-item--bottom-right'
            style={{ backgroundImage: `url('${imageSrc[3]}')` }}
          />
        </div>
      )
    }

    // For single images (albums, artists, or playlists without enough songs)
    const singleImageSrc = Array.isArray(imageSrc) 
      ? imageSrc[0] || '/art/imag_1.jpg' 
      : imageSrc || '/art/imag_1.jpg'
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
