import './MusicSidebar.scss'

import React, { useState } from 'react'
import { useNavigate } from 'react-router'

import CreatePlaylistModal from '~/components/ui/CreatePlaylistModal'
import MuzaIcon from '~/icons/MuzaIcon'
import { useTranslation } from '~/lib/i18n/translations'
import type { MenuItem, MusicPlaylist, Section } from '~/store/models'
import { usePlaylistStore } from '~/store/playlistStore'

import type { PlaylistVisibilityEnum } from '../../../server/db/playlist.entity'

interface MusicSidebarProps {
  logoSrc: string
  logoAlt?: string
  sections: Section[]
  playlists?: MusicPlaylist[]
  isCollapsed?: boolean
  _onOpenPlaylistDrawer?: (playlist?: MusicPlaylist) => void
  onToggleCollapse?: () => void
}

const MusicSidebar: React.FC<MusicSidebarProps> = ({
  logoSrc,
  logoAlt = 'Logo',
  sections,
  playlists = [],
  isCollapsed = false,
  _onOpenPlaylistDrawer,
  onToggleCollapse,
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const addPlaylist = usePlaylistStore(state => state.addPlaylist)
  const loading = usePlaylistStore(state => state.loading)
  const [internalCollapsed, setInternalCollapsed] = useState(false) // Start open by default
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Use external collapsed state if provided, otherwise use internal state
  const collapsedState = isCollapsed !== undefined ? isCollapsed : internalCollapsed

  const handleItemClick = (item: MenuItem) => {
    if (item.action) {
      React.startTransition(() => {
        navigate(item.action!)
      })
    }
  }

  const handlePlaylistClick = (playlist: MusicPlaylist) => {
    if (_onOpenPlaylistDrawer) {
      _onOpenPlaylistDrawer(playlist)
    }
  }

  const handleSidebarToggle = () => {
    if (isCollapsed !== undefined && onToggleCollapse) {
      // External control - trigger parent callback
      onToggleCollapse()
      return
    }
    setInternalCollapsed(!internalCollapsed)
  }

  const handleCreatePlaylist = () => {
    // Always open modal first for playlist creation
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
  }

  const handleCreatePlaylistSubmit = async (name: string, visibility: PlaylistVisibilityEnum) => {
    await addPlaylist(name, visibility)
    setIsModalOpen(false)
  }

  const renderMenuItem = (item: MenuItem, index: number) => {
    return (
      <a key={index} className='menu-item' onClick={() => handleItemClick(item)}>
        <MuzaIcon iconName={item.svg} />
        {!collapsedState && <span>{t(item.text)}</span>}
      </a>
    )
  }

  const renderSection = (section: Section, index: number) => (
    <div key={index} className='section'>
      {section.title && !collapsedState && <div className='section-title'>{t(section.title)}</div>}
      {section.items.map(renderMenuItem)}
    </div>
  )

  const renderPlaylist = (playlist: MusicPlaylist, index: number) => (
    <div
      key={playlist.id || index}
      className='playlist-item'
      onClick={() => handlePlaylistClick(playlist)}
    >
      <MuzaIcon iconName='playlist' />
      {!collapsedState && <span>{playlist.title}</span>}
    </div>
  )

  return (
    <div className={`music-sidebar ${collapsedState ? 'collapsed' : ''}`}>
      <div className='logo'>
        <img src={logoSrc} alt={logoAlt} />
      </div>

      <div className='sidebar-content'>
        <div className='nav-sections'>{sections.map(renderSection)}</div>

        {playlists.length > 0 && !collapsedState && (
          <div className='playlists-section'>
            <div className='playlists-header'>
              <div className='playlists-title'>{t('nav.playlists')}</div>
              <button className='add-button' onClick={handleCreatePlaylist}>
                <MuzaIcon iconName='plus' />
              </button>
            </div>
            <div className='playlists-list'>{playlists.map(renderPlaylist)}</div>
          </div>
        )}
      </div>

      <div className='sidebar-footer'>
        <button
          className='sidebar-header-button'
          onClick={handleSidebarToggle}
          aria-label={collapsedState ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <MuzaIcon iconName={collapsedState ? 'PanelLeftOpen' : 'PanelLeftClose'} />
        </button>
      </div>

      <CreatePlaylistModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onCreatePlaylist={handleCreatePlaylistSubmit}
      />
    </div>
  )
}

export default React.memo(MusicSidebar)
