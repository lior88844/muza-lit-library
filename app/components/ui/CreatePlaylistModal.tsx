import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import MuzaIcon from '~/icons/MuzaIcon'

import { PlaylistVisibilityEnum } from '../../../server/db/playlist.entity'
import { Button } from './button'
import { Dialog } from './dialog'
import { Input } from './input'
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

  const handleToggleChange = (checked: boolean) => {
    setIsPrivate(checked)
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
      title={<Typography variant='h3'>{t('playlist.new')}</Typography>}
      ContentProps={{ className: 'w-[448px]' }}
    >
      <div className='flex flex-col gap-4'>
        <Input
          value={playlistName}
          label={t('playlist.title')}
          placeholder={t('playlist.titlePlaceholder')}
          className='w-full'
          onChange={e => setPlaylistName(e.target.value)}
        />

        <div>
          <Switch
            checked={isPrivate}
            onCheckedChange={handleToggleChange}
            label={
              <Typography variant='default' className='ms-2 flex items-center gap-2 font-medium'>
                <MuzaIcon iconName='lock' className='size-4' />
                {t('playlist.makePrivate')}
              </Typography>
            }
          />
          <Typography className='text-text-muted ms-11 me-15'>
            {t('playlist.privateExplanation')}
          </Typography>
        </div>
      </div>

      <div className='flex justify-end gap-4'>
        <Button variant='secondary' type='button' onClick={onClose}>
          {t('playlist.cancel')}
        </Button>
        <Button type='button' onClick={handleSubmit} disabled={!playlistName.trim()}>
          {t('playlist.create')}
        </Button>
      </div>
    </Dialog>
  )
}

export default CreatePlaylistModal
