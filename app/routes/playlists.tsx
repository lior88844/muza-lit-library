import '../styles/variables.css'

import { useState } from 'react'
import { useNavigate } from 'react-router'

import PlaylistGrid from '~/components/listsDisplays/PlaylistGrid'
import CreatePlaylistModal from '~/components/ui/CreatePlaylistModal'
import { Divider } from '~/components/ui/divider'
import { Typography } from '~/components/ui/typography'
import { useTranslation } from '~/lib/i18n/translations'
import { useMedia } from '~/store/media/mediaContext'
import { useAddPlaylist } from '~/store/media/useAddPlaylist'
import type { MusicPlaylist } from '~/store/models'

import type { PlaylistVisibilityEnum } from '../../server/db/playlist.entity'

export default function Playlists() {
  const { t } = useTranslation()
  const { playlists, library } = useMedia()
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
    <>
      <Typography variant='h1' as='h2' className='pb-4'>
        {t('page.playlists')}
      </Typography>
      <Divider />

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
    </>
  )
}
