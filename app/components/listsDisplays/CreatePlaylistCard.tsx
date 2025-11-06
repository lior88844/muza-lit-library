import React from 'react'
import { useTranslation } from 'react-i18next'

import MuzaIcon from '~/icons/MuzaIcon'

import styles from './CreatePlaylistCard.module.css'

interface CreatePlaylistCardProps {
  onClick: () => void
}

const CreatePlaylistCard: React.FC<CreatePlaylistCardProps> = ({ onClick }) => {
  const { t } = useTranslation()

  return (
    <button className={styles.createPlaylistCard} onClick={onClick}>
      <div className={styles.createPlaylistContent}>
        <div className={styles.plusIconContainer}>
          <div className={styles.plusIconCircle}>
            <MuzaIcon iconName='plus' className={styles.plusIcon} />
          </div>
        </div>
        <p className={styles.createPlaylistText}>{t('playlist.createNew')}</p>
      </div>
    </button>
  )
}

export default CreatePlaylistCard
