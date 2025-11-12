import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import CreatePlaylistModal from '~/components/ui/CreatePlaylistModal'
import MuzaIcon from '~/icons/MuzaIcon'
import type { TransKey } from '~/lib/i18n/i18next'
import type { MenuItem, MusicPlaylist, Section } from '~/store/models'

import type { PlaylistVisibilityEnum } from '../../../server/db/playlist.entity'
import { useAddPlaylist } from '../../store/media/useAddPlaylist'
import styles from './MusicSidebar.module.css'

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
  const { addPlaylist } = useAddPlaylist()
  const [internalCollapsed, setInternalCollapsed] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

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
      <a key={index} className={styles['menu-item']} onClick={() => handleItemClick(item)}>
        <MuzaIcon iconName={item.svg} />
        {!collapsedState && <span>{t(item.text as TransKey)}</span>}
      </a>
    )
  }

  const renderSection = (section: Section, index: number) => (
    <div key={index} className={styles.section}>
      {section.title && !collapsedState && (
        <div className={styles['section-title']}>{t(section.title as TransKey)}</div>
      )}
      {section.items.map(renderMenuItem)}
    </div>
  )

  const renderPlaylist = (playlist: MusicPlaylist, index: number) => (
    <div
      key={playlist.id || index}
      className={styles['playlist-item']}
      onClick={() => handlePlaylistClick(playlist)}
    >
      <MuzaIcon iconName='playlist' />
      {!collapsedState && <span>{playlist.title}</span>}
    </div>
  )

  return (
    <div className={`${styles['music-sidebar']} ${collapsedState ? styles.collapsed : ''}`}>
      <div className={styles.logo}>
        <img src={logoSrc} alt={logoAlt} />
      </div>

      <div className={styles['sidebar-content']}>
        <div className={styles['nav-sections']}>{sections.map(renderSection)}</div>

        {playlists.length > 0 && !collapsedState && (
          <div className={styles['playlists-section']}>
            <div className={styles['playlists-header']}>
              <div className={styles['playlists-title']}>{t('nav.playlists')}</div>
              <button className={styles['add-button']} onClick={handleCreatePlaylist}>
                <MuzaIcon iconName='plus' />
              </button>
            </div>
            <div className={styles['playlists-list']}>{playlists.map(renderPlaylist)}</div>
          </div>
        )}
      </div>

      <div className={styles['sidebar-footer']}>
        <button
          className={styles['sidebar-header-button']}
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
