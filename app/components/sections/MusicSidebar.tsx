import React, { useState } from "react";
import "./MusicSidebar.scss";
import MuzaIcon from "~/icons/MuzaIcon";
import CreatePlaylistModal from "~/components/ui/CreatePlaylistModal";
import type { MenuItem, Section, MusicPlaylist } from "~/appData/models";
import { useNavigate } from "react-router";
import { useTranslation } from "~/lib/i18n/translations";
import { useMusicLibraryStore } from "~/appData/musicStore";
import { useCurrentPlayerStore } from "~/appData/currentPlayerStore";

interface MusicSidebarProps {
  logoSrc: string;
  logoAlt?: string;
  sections: Section[];
  playlists?: MusicPlaylist[];
  isCollapsed?: boolean;
  onOpenPlaylistDrawer?: (playlist?: MusicPlaylist) => void;
  onToggleCollapse?: () => void;
}

const MusicSidebar: React.FC<MusicSidebarProps> = ({
  logoSrc,
  logoAlt = "Logo",
  sections,
  playlists = [],
  isCollapsed = false,
  onOpenPlaylistDrawer,
  onToggleCollapse,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { createPlaylist } = useMusicLibraryStore();
  const { openPlaylistDrawer } = useCurrentPlayerStore();
  const [internalCollapsed, setInternalCollapsed] = useState(false); // Start open by default
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use external collapsed state if provided, otherwise use internal state
  const collapsedState =
    isCollapsed !== undefined ? isCollapsed : internalCollapsed;

  const handleItemClick = (item: MenuItem) => {
    if (item.action) {
      React.startTransition(() => {
        navigate(item.action!);
      });
    }
  };

  const handlePlaylistClick = (playlist: MusicPlaylist) => {
    // Navigate to playlist page or handle playlist selection
  };

  const handleSidebarToggle = () => {
    if (isCollapsed !== undefined && onToggleCollapse) {
      // External control - trigger parent callback
      onToggleCollapse();
      return;
    }
    setInternalCollapsed(!internalCollapsed);
  };

  const handleCreatePlaylist = () => {
    // Always open modal first for playlist creation
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

    // Open drawer with the newly created playlist using global store
    openPlaylistDrawer(newPlaylist.id);
  };

  const renderMenuItem = (item: MenuItem, index: number) => {
    return (
      <a
        key={index}
        className="menu-item"
        onClick={() => handleItemClick(item)}
      >
        <MuzaIcon iconName={item.svg} />
        {!collapsedState && <span>{t(item.text)}</span>}
      </a>
    );
  };

  const renderSection = (section: Section, index: number) => (
    <div key={index} className="section">
      {section.title && !collapsedState && (
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
      {!collapsedState && <span>{playlist.title}</span>}
    </div>
  );

  // Filter out playlists with no songs
  const playlistsWithSongs = playlists.filter(
    playlist => playlist.songs && playlist.songs.length > 0
  );

  return (
    <div className={`music-sidebar ${collapsedState ? "collapsed" : ""}`}>
      <div className="logo">
        <img src={logoSrc} alt={logoAlt} />
      </div>

      <div className="sidebar-content">
        <div className="nav-sections">{sections.map(renderSection)}</div>

        {playlistsWithSongs.length > 0 && !collapsedState && (
          <div className="playlists-section">
            <div className="playlists-header">
              <div className="playlists-title">{t("nav.playlists")}</div>
              <button className="add-button" onClick={handleCreatePlaylist}>
                <MuzaIcon iconName="plus" />
              </button>
            </div>
            <div className="playlists-list">
              {playlistsWithSongs.map(renderPlaylist)}
            </div>
          </div>
        )}
      </div>

      <div className="sidebar-footer">
        <button
          className="sidebar-header-button"
          onClick={handleSidebarToggle}
          aria-label={collapsedState ? "Expand sidebar" : "Collapse sidebar"}
        >
          <MuzaIcon
            iconName={collapsedState ? "PanelLeftOpen" : "PanelLeftClose"}
          />
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
