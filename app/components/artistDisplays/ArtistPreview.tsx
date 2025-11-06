import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { EntityTypeEnum } from 'server/db/stack.entity'

import { useDraggable } from '~/lib/hooks/useDraggable'

import type { Artist } from '../../store/models'
import styles from './ArtistPreview.module.css'

interface ArtistDetailsProps {
  details: Artist
  draggable?: boolean
}

const ArtistPreview: React.FC<ArtistDetailsProps> = ({ details, draggable = false }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { dragHandlers } = useDraggable({
    type: EntityTypeEnum.Artist,
    data: details,
    enabled: draggable,
  })

  const onArtistClick = () => {
    navigate(`/artists/${details.id}`)
  }
  return (
    <div className={styles['artist-details-card']} {...dragHandlers} onClick={onArtistClick}>
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
