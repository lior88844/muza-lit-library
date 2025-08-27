import React from "react";
import "./MusicSidebar.scss";
import MuzaIcon from "~/icons/MuzaIcon";
import type { MenuItem, Section, MusicPlaylist } from "~/appData/models";
import { useNavigate } from "react-router";
import { useTranslation } from "~/lib/i18n/translations";

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
    // Handle sidebar collapse/expand functionality
    console.log("Sidebar toggle clicked");
  };

  const renderMenuItem = (item: MenuItem, index: number) => {
    return (
      <a
        key={index}
        className="menu-item"
        onClick={() => handleItemClick(item)}
      >
        <MuzaIcon iconName={item.svg} />
        <span>{t(item.text)}</span>
      </a>
    );
  };

  const renderSection = (section: Section, index: number) => (
    <div key={index} className="section">
      {section.title && <div className="section-title">{t(section.title)}</div>}
      {section.items.map(renderMenuItem)}
    </div>
  );

  const renderPlaylist = (playlist: MusicPlaylist, index: number) => (
    <div
      key={playlist.id || index}
      className="menu-item"
      onClick={() => handlePlaylistClick(playlist)}
    >
      <MuzaIcon iconName="playlist" />
      <span>{playlist.title}</span>
    </div>
  );

  return (
    <div className="music-sidebar">
      <div className="logo">
        <img src={logoSrc} alt={logoAlt} />
      </div>
      
      {sections.map(renderSection)}
      
      {playlists.length > 0 && (
        <div className="playlists-section">
          <div className="playlists-header">
            <div className="playlists-title">{t("nav.playlists")}</div>
            <button className="add-button">
              <MuzaIcon iconName="plus" />
            </button>
          </div>
          <div className="playlists-list">
            {playlists.map(renderPlaylist)}
          </div>
        </div>
      )}
      
      <div className="sidebar-footer">
        <button 
          className="sidebar-header-button"
          onClick={handleSidebarToggle}
          aria-label="Toggle sidebar"
        >
          <MuzaIcon iconName="PanelLeftClose" />
        </button>
      </div>
    </div>
  );
};

export default React.memo(MusicSidebar);
