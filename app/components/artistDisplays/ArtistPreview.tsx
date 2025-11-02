import './ArtistPreview.scss'

import React from 'react'
import { useNavigate } from 'react-router'

import { useTranslation } from '~/lib/i18n/translations'

import type { Artist } from '../../store/models'

interface ArtistDetailsProps {
  details: Artist
}

const ArtistPreview: React.FC<ArtistDetailsProps> = ({ details }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const onArtistClick = () => {
    navigate(`/artists/${details.id}`)
  }
  return (
    <div className='artist-details-card' onClick={onArtistClick}>
      <div className='image-container'>
        <img src={details.imageUrl || ''} alt={details.name} />
      </div>
      <div className='info'>
        <div className='title'>{details.name}</div>
        <div className='subtitle'>
          {details.albumsCount} {t('common.albums')}
        </div>
      </div>
    </div>
  )
}

export default ArtistPreview
