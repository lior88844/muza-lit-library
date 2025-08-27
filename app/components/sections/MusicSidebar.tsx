import React, { useState } from "react";
import "./MusicSidebar.scss";
import MuzaIcon from "~/icons/MuzaIcon";
import CreatePlaylistModal from "~/components/ui/CreatePlaylistModal";
import type { MenuItem, Section, MusicPlaylist } from "~/appData/models";
import { useNavigate } from "react-router";
import { useTranslation } from "~/lib/i18n/translations";
import { useMusicLibraryStore } from "~/appData/musicStore";

interface MusicSidebarProps {
  logoSrc: string;
  logoAlt?: string;
  sections: Section[];
  playlists?: MusicPlaylist[];
}

const MusicSidebar: React.FC<MusicSidebarProps> = ({
  logoSrc,
  logoAlt = "Logo",
  sections,
  playlists = [],
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { createPlaylist } = useMusicLibraryStore();
  const [isCollapsed, setIsCollapsed] = useState(true); // Start collapsed by default
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleItemClick = (item: MenuItem) => {
    if (item.action) {
      React.startTransition(() => {
        navigate(item.action!);
      });
    }
  };

  const handlePlaylistClick = (playlist: MusicPlaylist) => {
    // Navigate to playlist page or handle playlist selection
    console.log("Playlist clicked:", playlist.title);
  };

  const handleSidebarToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleCreatePlaylist = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleCreatePlaylistSubmit = (name: string, visibility: string) => {
    // Create the new playlist
    const newPlaylist = {
      id: Date.now().toString(), // Simple ID generation
      title: name,
      name,
      visibility,
      songs: [],
      suggestions: [],
      imageSrc: "", // Will be set when songs are added
      createdAt: new Date().toISOString(),
    };

    // Add to store
    createPlaylist(newPlaylist);
    setIsModalOpen(false);
  };

  const renderMenuItem = (item: MenuItem, index: number) => {
    return (
      <a
        key={index}
        className="menu-item"
        onClick={() => handleItemClick(item)}
      >
        <MuzaIcon iconName={item.svg} />
        {!isCollapsed && <span>{t(item.text)}</span>}
      </a>
    );
  };

  const renderSection = (section: Section, index: number) => (
    <div key={index} className="section">
      {section.title && !isCollapsed && (
        <div className="section-title">{t(section.title)}</div>
      )}
      {section.items.map(renderMenuItem)}
    </div>
  );

  const renderPlaylist = (playlist: MusicPlaylist, index: number) => (
    <div
      key={playlist.id || index}
      className="playlist-item"
      onClick={() => handlePlaylistClick(playlist)}
    >
      <MuzaIcon iconName="playlist" />
      {!isCollapsed && <span>{playlist.title}</span>}
    </div>
  );

  return (
    <div className={`music-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="logo">
        <img src={logoSrc} alt={logoAlt} />
      </div>
      
      <div className="sidebar-content">
        <div className="nav-sections">
          {sections.map(renderSection)}
        </div>
        
        {playlists.length > 0 && !isCollapsed && (
          <div className="playlists-section">
                      <div className="playlists-header">
            <div className="playlists-title">{t("nav.playlists")}</div>
            <button className="add-button" onClick={handleCreatePlaylist}>
              <MuzaIcon iconName="plus" />
            </button>
          </div>
            <div className="playlists-list">
              {playlists.map(renderPlaylist)}
            </div>
          </div>
        )}
      </div>
      
      <div className="sidebar-footer">
        <button 
          className="sidebar-header-button"
          onClick={handleSidebarToggle}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <MuzaIcon iconName={isCollapsed ? "PanelLeftOpen" : "PanelLeftClose"} />
        </button>
      </div>

      <CreatePlaylistModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onCreatePlaylist={handleCreatePlaylistSubmit}
      />
    </div>
  );
};

export default React.memo(MusicSidebar);
