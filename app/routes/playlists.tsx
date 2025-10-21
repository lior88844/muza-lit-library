import '../styles/scrollbar.scss'
import '../styles/variables.scss'
import '../styles/main.scss'

import { useState } from 'react'
import { useNavigate } from 'react-router'

import PlaylistGrid from '~/components/listsDisplays/PlaylistGrid'
import CreatePlaylistModal from '~/components/ui/CreatePlaylistModal'
import { useTranslation } from '~/lib/i18n/translations'
import { useCurrentPlayerStore } from '~/store/currentPlayerStore'
import { useMedia } from '~/store/media/mediaContext'

export default function Playlists() {
  const { t } = useTranslation()
  const library = useMedia()
  const playlists = library.playlists
  const { openPlaylistDrawer } = useCurrentPlayerStore()
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handlePlaylistClick = (playlist: any) => {
    // Navigate to individual playlist detail page using state like albums
    navigate('/playlist', { state: { playlist } })
  }

  const handleCreatePlaylist = () => {
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
  }

  const handleCreatePlaylistSubmit = (name: string, visibility: string) => {
    // Create the new playlist
    const newPlaylist = {
      id: Date.now(), // Simple ID generation
      title: name,
      name,
      visibility,
      songs: [],
      suggestions: [],
      imageSrc: '', // Will be set when songs are added
      createdAt: new Date().toISOString(),
    }

    // TODO: Submit to server action to create playlist
    // For now, just close the modal
    setIsModalOpen(false)

    // Open the playlist drawer with the newly created playlist
    openPlaylistDrawer(newPlaylist.id)
  }

  return (
    <main>
      <h1>{t('page.playlists')}</h1>
      <hr />

      <PlaylistGrid playlists={playlists} onPlaylistClick={handlePlaylistClick} onCreatePlaylist={handleCreatePlaylist} />

      <CreatePlaylistModal isOpen={isModalOpen} onClose={handleModalClose} onCreatePlaylist={handleCreatePlaylistSubmit} />
    </main>
  )
}
