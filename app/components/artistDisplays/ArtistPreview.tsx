import React from 'react'
import { useNavigate } from 'react-router'

import { useTranslation } from '~/lib/i18n/translations'

import type { Artist } from '../../store/models'
import styles from './ArtistPreview.module.css'

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
    <div className={styles['artist-details-card']} onClick={onArtistClick}>
      <div className={styles['image-container']}>
        <img src={details.imageUrl || ''} alt={details.name} />
      </div>
      <div className={styles.info}>
        <div className={styles.title}>{details.name}</div>
        <div className={styles.subtitle}>
          {details.albumsCount} {t('common.albums')}
        </div>
      </div>
    </div>
  )
}

export default ArtistPreview
