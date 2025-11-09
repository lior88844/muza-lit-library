import { debounce } from 'lodash-es'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FaSearch } from 'react-icons/fa'
import { useNavigate } from 'react-router'

import MuzaIcon from '~/icons/MuzaIcon'
import { getUserInfo, useAuth } from '~/store/userContext'

import { Input } from '../ui/input'
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

  const debouncedHandleSearch = useMemo(
    () =>
      debounce((searchText: string) => {
        const newValue = searchText.trim()
        const redirectTo = newValue ? `/search?q=${encodeURIComponent(newValue)}` : '/'
        navigate(redirectTo)
      }, DEBOUNCE_SEARCH_MS),
    [navigate]
  )

  return (
    <div className={styles['music-topbar']}>
      <div className={styles.topbar}>
        <Input
          variant='ghost'
          placeholder={t('form.searchPlaceholder')}
          iconStart={<FaSearch className='text-muted-foreground' />}
          className='w-full px-8'
          inputClassName='text-lg'
          containerClassName='grow'
          onChange={e => debouncedHandleSearch(e.target.value)}
        />
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

const DEBOUNCE_SEARCH_MS = 500

export default React.memo(MusicTopbar)
