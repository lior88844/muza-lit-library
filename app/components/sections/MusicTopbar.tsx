import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import MuzaIcon from '~/icons/MuzaIcon'
import { getUserInfo, useAuth } from '~/store/userContext'

import { SearchInput } from '../search/search-input'
import styles from './MusicTopbar.module.css'

interface MusicTopbarProps {
  onUserIconClick?: () => void
}

const MusicTopbar: React.FC<MusicTopbarProps> = ({ onUserIconClick }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const auth = useAuth()

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

  return (
    <div className='bg-background-light border-border-light sticky top-0 z-50 border-b pe-6'>
      <div className={styles.topbar}>
        <SearchInput />

        <div className={styles.controls}>
          <button className={styles['upload-music-button']} onClick={handleUploadClick}>
            {t('upload.uploadMusic')}
            <MuzaIcon iconName='upload' />
          </button>

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
