import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import MuzaInputField from '~/controls/MuzaInputField'
import MuzaIcon from '~/icons/MuzaIcon'
import { cn } from '~/lib/utils'

import { PlaylistVisibilityEnum } from '../../../server/db/playlist.entity'
import { Button, IconButton } from './button'
import styles from './CreatePlaylistModal.module.css'
import { Switch } from './switch'
import { Typography } from './typography'

interface CreatePlaylistModalProps {
  isOpen: boolean
  onClose: () => void
  onCreatePlaylist: (name: string, visibility: PlaylistVisibilityEnum) => void
}

const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({
  isOpen,
  onClose,
  onCreatePlaylist,
}) => {
  const { t } = useTranslation()
  const [playlistName, setPlaylistName] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey)
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey)
    }
  }, [isOpen, onClose])

  // Remove the early return to allow transitions

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (playlistName.trim()) {
      const visibility = isPrivate ? PlaylistVisibilityEnum.Private : PlaylistVisibilityEnum.Public
      onCreatePlaylist(playlistName.trim(), visibility)
      setPlaylistName('')
      setIsPrivate(false)
      onClose()
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleToggleChange = (checked: boolean) => {
    setIsPrivate(checked)
  }

  return (
    <div
      className={`${styles.modalBackdrop} ${isOpen ? styles.modalOpen : ''}`}
      onClick={handleBackdropClick}
    >
      <div className={`${styles.createPlaylistModal} ${isOpen ? styles.modalOpen : ''}`}>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <Typography variant='h3'>{t('playlist.new')}</Typography>
          </div>

          <div className={styles.modalContentInner}>
            <div className={styles.formGroup}>
              <MuzaInputField
                label={t('playlist.title')}
                placeholder={t('playlist.titlePlaceholder')}
                value={playlistName}
                onChange={e => setPlaylistName(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <div className={styles.privacyToggleWrapper}>
                <Switch
                  checked={isPrivate}
                  onCheckedChange={handleToggleChange}
                  label={
                    <Typography
                      variant='default'
                      className={cn(
                        'ms-2 flex items-center gap-2 font-medium',
                        styles.privacyToggleLabel
                      )}
                    >
                      {t('playlist.makePrivate')}
                    </Typography>
                  }
                />
                <p className={styles.privacyExplanation}>{t('playlist.privateExplanation')}</p>
              </div>
            </div>
          </div>

          <div className={styles.modalButtons}>
            <Button variant='secondary' type='button' onClick={onClose}>
              {t('playlist.cancel')}
            </Button>
            <Button type='button' onClick={handleSubmit} disabled={!playlistName.trim()}>
              {t('playlist.create')}
            </Button>
          </div>

          <IconButton
            icon={<MuzaIcon iconName='Close' />}
            variant='ghost'
            className={styles.closeButton}
            onClick={onClose}
          />
        </div>
      </div>
    </div>
  )
}

export default CreatePlaylistModal
