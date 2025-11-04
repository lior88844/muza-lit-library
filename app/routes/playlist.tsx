import '../styles/scrollbar.scss'
import '../styles/variables.scss'
import '../styles/main.scss'

import React from 'react'
import { useNavigate, useParams } from 'react-router'

import PlaylistDetail from '~/components/playlistDisplays/PlaylistDetail'
import { useTranslation } from '~/lib/i18n/translations'
import { useMedia } from '~/store/media/mediaContext'

export default function PlaylistPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const { playlists } = useMedia()
  const navigate = useNavigate()
  const playlist = playlists.find(p => p.id === parseInt(id!, 10))

  if (!playlist) {
    return (
      <main>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>{t('error.playlistNotFound') || 'Playlist not found'}</h1>
          <button onClick={() => navigate('/playlists')}>
            {t('common.backToPlaylists') || 'Back to Playlists'}
          </button>
        </div>
      </main>
    )
  }

  return (
    <main>
      <PlaylistDetail playlist={playlist} />
    </main>
  )
}
