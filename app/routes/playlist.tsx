import '../styles/variables.css'

import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'

import PlaylistDetail from '~/components/playlistDisplays/PlaylistDetail'
import { Typography } from '~/components/ui/typography'

import { useMedia } from '../store/media/mediaContext'

export default function PlaylistPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const { playlists } = useMedia()
  const navigate = useNavigate()
  const playlist = playlists.find(playlist => playlist.id === parseInt(id!, 10))

  if (!playlist) {
    return (
      <>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <Typography variant='h1' as='h2' className='pb-4'>
            {t('error.playlistNotFound') || 'Playlist not found'}
          </Typography>

          <button onClick={() => navigate('/playlists')}>
            {t('common.backToPlaylists') || 'Back to Playlists'}
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      <PlaylistDetail playlist={playlist} />
    </>
  )
}
