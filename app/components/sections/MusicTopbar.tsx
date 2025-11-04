import React from 'react'
import { useNavigate } from 'react-router'

import MuzaIcon from '~/icons/MuzaIcon'
import { useTranslation } from '~/lib/i18n/translations'
import { getUserInfo, useAuth } from '~/store/userContext'

import styles from './MusicTopbar.module.css'

interface MusicTopbarProps {
  onSearchChange?: (searchText: string) => void
  onUserIconClick?: () => void
}

const MusicTopbar: React.FC<MusicTopbarProps> = ({ onSearchChange, onUserIconClick }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const auth = useAuth()

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange?.(e.target.value)
  }

  const handleUploadClick = () => {
    navigate('/upload')
  }

  const handleLoginClick = () => {
    auth.signinRedirect()
  }

  const handleLogoutClick = () => {
    auth.signoutRedirect({
      extraQueryParams: {
        client_id: import.meta.env.VITE_COGNITO_CLIENT_ID,
        logout_uri: `${window.location.origin}/`,
      },
    })
  }

  const handleAdminUploadClick = () => {
    navigate('/admin-upload')
  }

  return (
    <div className={styles['music-topbar']}>
      <div className={styles.topbar}>
        <div className={styles['search-container']}>
          <div className={styles['search-input-wrapper']}>
            <div className={styles['search-input']}>
              <div className={styles['search-input-content']}>
                <div className={styles['search-icon']}>
                  <MuzaIcon iconName='search' />
                </div>
                <input
                  type='text'
                  placeholder={t('form.searchPlaceholder')}
                  onChange={handleSearchInput}
                  className={styles['search-field']}
                />
              </div>
              <div className={styles['search-border']} aria-hidden='true' />
            </div>
          </div>
        </div>
        <div className={styles.controls}>
          <button className={styles['upload-music-button']} onClick={handleUploadClick}>
            {t('upload.uploadMusic')}
            <MuzaIcon iconName='upload' />
          </button>
          {/* <button
            className={styles["admin-upload-button"]}
            onClick={handleAdminUploadClick}
          >
            {t("upload.uploadAdmin")}
            <MuzaIcon iconName="adminUpload" />
          </button> */}
          <div className={styles['user-menu']}>
            {auth.isAuthenticated ? (
              <div className={styles['user-dropdown']}>
                <div className={styles['user-icon']} onClick={onUserIconClick}>
                  <img
                    src={getUserInfo(auth)?.picture || '/art/logo.jpg'}
                    alt={getUserInfo(auth)?.name || t('topbar.user')}
                  />
                </div>
                <div className={styles['user-info']}>
                  <span className={styles['user-name']}>
                    {getUserInfo(auth)?.name || getUserInfo(auth)?.email}
                  </span>
                  <button
                    className={styles['logout-button']}
                    onClick={handleLogoutClick}
                    title='Logout'
                  >
                    <MuzaIcon iconName='logout' />
                  </button>
                </div>
              </div>
            ) : (
              <button className={styles['login-button']} onClick={handleLoginClick}>
                <MuzaIcon iconName='user' />
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(MusicTopbar)
