import '../styles/scrollbar.scss'
import '../styles/variables.scss'
import '../styles/main.scss'

import { useState } from 'react'
import { useNavigate } from 'react-router'

import PlaylistGrid from '~/components/listsDisplays/PlaylistGrid'
import CreatePlaylistModal from '~/components/ui/CreatePlaylistModal'
import { useTranslation } from '~/lib/i18n/translations'
import { useMedia } from '~/store/media/mediaContext'
import { useAddPlaylist } from '~/store/media/useAddPlaylist'
import type { MusicPlaylist } from '~/store/models'

import type { PlaylistVisibilityEnum } from '../../server/db/playlist.entity'

export default function Playlists() {
  const { t } = useTranslation()
  const { playlists } = useMedia()
  const navigate = useNavigate()
  const { addPlaylist } = useAddPlaylist()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handlePlaylistClick = (playlist: MusicPlaylist) => {
    // Navigate to individual playlist detail page using state like albums
    navigate(`/playlists/${playlist.id}`)
  }

  const handleCreatePlaylist = () => {
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
  }

  const handleCreatePlaylistSubmit = async (name: string, visibility: PlaylistVisibilityEnum) => {
    await addPlaylist(name, visibility)
    setIsModalOpen(false)
  }

  return (
    <main>
      <h1>{t('page.playlists')}</h1>
      <hr />

      <PlaylistGrid
        playlists={playlists}
        onPlaylistClick={handlePlaylistClick}
        onCreatePlaylist={handleCreatePlaylist}
      />

      <CreatePlaylistModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onCreatePlaylist={handleCreatePlaylistSubmit}
      />
    </main>
  )
}
