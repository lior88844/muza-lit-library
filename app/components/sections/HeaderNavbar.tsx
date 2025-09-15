import React, { useState } from "react";
import { useNavigate } from "react-router";
import "./MusicTopbar.scss";
import { useTranslation } from "~/lib/i18n/translations";
import MuzaIcon from "~/icons/MuzaIcon";

interface HeaderNavbarProps {
  onSearchChange?: (searchText: string) => void;
  onUserIconClick?: () => void;
}

const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  onSearchChange,
  onUserIconClick,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange?.(e.target.value);
  };

  const handleUploadClick = () => {
    navigate("/upload");
  };

  const handleAdminUploadClick = () => {
    navigate("/admin-upload");
  };

  return (
    <div className="header-navbar">
      <div className="header-navbar-container">
        <div className="search-section">
          <div className="input-wrapper">
            <div className="input-container">
              <div className="input-content">
                <div className="search-icon">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14.0001 14L11.1335 11.1333M12.6667 7.33333C12.6667 10.2789 10.2789 12.6667 7.33333 12.6667C4.38781 12.6667 2 10.2789 2 7.33333C2 4.38781 4.38781 2 7.33333 2C10.2789 2 12.6667 4.38781 12.6667 7.33333Z"
                      stroke="var(--colors_foreground_light)"
                      strokeWidth="1.33"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder={t("form.searchPlaceholder")}
                  onChange={handleSearchInput}
                  className="search-input"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="actions-section">
          <button className="upload-button" onClick={handleUploadClick}>
            <span className="upload-text">{t("upload.uploadMusic")}</span>
            <div className="upload-icon">
              <MuzaIcon iconName="upload" />
            </div>
          </button>

          <div className="avatar-container" onClick={onUserIconClick}>
            <img
              src="/art/logo.jpg"
              alt={t("topbar.user")}
              className="avatar-image"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(HeaderNavbar);
