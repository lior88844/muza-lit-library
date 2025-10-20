import React from "react";
import { useNavigate } from "react-router";
import "./MusicTopbar.scss";
import { useTranslation } from "~/lib/i18n/translations";
import MuzaIcon from "~/icons/MuzaIcon";
import { useAuth, getUserInfo } from "~/appData/authStore";

interface MusicTopbarProps {
  onSearchChange?: (searchText: string) => void;
  onUserIconClick?: () => void;
}

const MusicTopbar: React.FC<MusicTopbarProps> = ({
  onSearchChange,
  onUserIconClick,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const auth = useAuth();

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange?.(e.target.value);
  };

  const handleUploadClick = () => {
    navigate("/upload");
  };

  const handleLoginClick = () => {
    auth.signinRedirect();
  };

  const handleLogoutClick = () => {
    auth.signoutRedirect({
      extraQueryParams: {
        client_id: import.meta.env.VITE_COGNITO_CLIENT_ID,
        logout_uri: `${window.location.origin}/`,
      },
    });
  };

  const handleAdminUploadClick = () => {
    navigate("/admin-upload");
  };

  return (
    <div className="music-topbar">
      <div className="topbar">
        <div className="search-container">
          <div className="search-input-wrapper">
            <div className="search-input">
              <div className="search-input-content">
                <div className="search-icon">
                  <MuzaIcon iconName="search" />
                </div>
                <input
                  type="text"
                  placeholder={t("form.searchPlaceholder")}
                  onChange={handleSearchInput}
                  className="search-field"
                />
              </div>
              <div className="search-border" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="controls">
          <button className="upload-music-button" onClick={handleUploadClick}>
            {t("upload.uploadMusic")}
            <MuzaIcon iconName="upload" />
          </button>
          <button
            className="admin-upload-button"
            onClick={handleAdminUploadClick}
          >
            {t("upload.uploadAdmin")}
            <MuzaIcon iconName="adminUpload" />
          </button>
          <div className="user-menu">
            {auth.isAuthenticated ? (
              <div className="user-dropdown">
                <div className="user-icon" onClick={onUserIconClick}>
                  <img
                    src={getUserInfo(auth)?.picture || "/art/logo.jpg"}
                    alt={getUserInfo(auth)?.name || t("topbar.user")}
                  />
                </div>
                <div className="user-info">
                  <span className="user-name">
                    {getUserInfo(auth)?.name || getUserInfo(auth)?.email}
                  </span>
                  <button
                    className="logout-button"
                    onClick={handleLogoutClick}
                    title="Logout"
                  >
                    <MuzaIcon iconName="logout" />
                  </button>
                </div>
              </div>
            ) : (
              <button className="login-button" onClick={handleLoginClick}>
                <MuzaIcon iconName="user" />
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(MusicTopbar);
