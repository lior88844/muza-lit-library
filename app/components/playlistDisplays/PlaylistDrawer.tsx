import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'

import SongLineWithCover from '~/components/songLineDisplays/SongLineWithCover'
import MuzaButton from '~/controls/MuzaButton'
import MuzaInputField from '~/controls/MuzaInputField'
import MuzaIcon from '~/icons/MuzaIcon'
import { useTranslation } from '~/lib/i18n/translations'
import type { MusicPlaylist, SongDetails } from '~/store/models'

import { PlaylistVisibilityEnum } from '../../../server/db/playlist.entity'
import { useUpdatePlaylist } from '../../store/media/useUpdatePlaylist'
import styles from './PlaylistDrawer.module.css'

interface PlaylistDrawerProps {
  isOpen: boolean
  onClose: () => void
  playlist?: MusicPlaylist
}

const PlaylistDrawer: React.FC<PlaylistDrawerProps> = ({ isOpen, onClose, playlist }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [playlistName, setPlaylistName] = useState(playlist?.title || '')
  const [playlistDescription, setPlaylistDescription] = useState(playlist?.description || '')
  const [isPublic, setIsPublic] = useState<boolean>(
    playlist?.visibility === PlaylistVisibilityEnum.Public || true
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const { updatePlaylist } = useUpdatePlaylist()
  // Update playlist name, description and visibility when playlist prop changes
  useEffect(() => {
    if (playlist?.title) {
      setPlaylistName(playlist.title)
    }
    if (playlist?.description) {
      setPlaylistDescription(playlist.description)
    }
    if (playlist?.visibility) {
      setIsPublic(playlist.visibility === PlaylistVisibilityEnum.Public)
    }
  }, [playlist?.title, playlist?.description, playlist?.visibility])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  // Helper functions for adding items to playlist
  const addSongToPlaylist = useCallback(
    (song: SongDetails) => {
      if (!playlist?.id) return

      // Check if song already exists in playlist
      const existingSong = playlist.songs?.find(
        existingSong =>
          existingSong.id === song.id ||
          (existingSong.title === song.title && existingSong.artist === song.artist)
      )

      if (existingSong) {
        return
      }
      updatePlaylist(playlist.id, {
        songs: [...playlist.songs, song],
      })
    },
    [playlist, updatePlaylist]
  )

  // Helper function for removing songs from playlist
  const removeSongFromPlaylist = useCallback(
    (songToRemove: SongDetails) => {
      if (!playlist?.id) return
      updatePlaylist(playlist.id, {
        songs: playlist.songs?.filter(song => song.id !== songToRemove.id) || [],
      })
    },
    [playlist, updatePlaylist]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      // Handle dropped files or data
      const files = Array.from(e.dataTransfer.files)
      const dragData = e.dataTransfer.getData('application/json')

      if (files.length > 0) {
        // TODO: Process dropped files and add to playlist
      }

      if (dragData) {
        try {
          const data = JSON.parse(dragData)

          // Handle only songs
          if (data.type === 'song' && data.song) {
            addSongToPlaylist(data.song)
          }
        } catch {
          // Silently handle parsing errors
        }
      }
    },
    [addSongToPlaylist]
  )

  // Note: handleSave is not used in the current UI
  // Playlist updates happen automatically through onSavePlaylist in add/remove song functions

  const handleClose = () => {
    onClose()
  }

  const handleNavigateToPlaylist = () => {
    if (playlist) {
      navigate(`/playlists/${playlist.id}`)
      onClose() // Close the drawer after navigation
    }
  }

  return (
    <div
      className={`${styles['playlist-drawer']} ${isOpen ? styles['playlist-drawer--open'] : ''}`}
    >
      <div className={styles['playlist-drawer__header']}>
        <div className={styles['playlist-drawer__header-left']}>
          <div className={styles['playlist-badge']}>
            <MuzaIcon iconName='playlist' />
            <span>{t('playlist.playlist')}</span>
          </div>
        </div>
        <div className={styles['playlist-drawer__header-right']}>
          <button className={styles['playlist-drawer__button']} onClick={handleClose}>
            <MuzaIcon iconName='ellipsis' />
          </button>
          <button className={styles['playlist-drawer__button']} onClick={handleNavigateToPlaylist}>
            <MuzaIcon iconName='MoveDiagonal' />
          </button>
          <button className={styles['playlist-drawer__button']} onClick={handleClose}>
            <MuzaIcon iconName='Close' />
          </button>
        </div>
      </div>

      <div className={styles['playlist-drawer__content']}>
        <div className={styles['playlist-drawer__info']}>
          <div className={styles['playlist-drawer__title-section']}>
            <MuzaInputField
              value={playlistName}
              onChange={e => setPlaylistName(e.target.value)}
              placeholder={t('playlist.enterName')}
              className={styles['playlist-drawer__title-input']}
              name='playlist-name'
            />
            <MuzaInputField
              value={playlistDescription}
              onChange={e => setPlaylistDescription(e.target.value)}
              placeholder={t('playlist.enterDescription')}
              className={styles['playlist-drawer__description-input']}
              name='playlist-description'
            />
          </div>

          <div className={styles['playlist-drawer__visibility-section']}>
            <div className={styles['playlist-drawer__visibility-badge']}>
              <MuzaIcon iconName='globe' />
              <span>{isPublic ? t('playlist.public') : t('playlist.private')}</span>
            </div>
          </div>
        </div>

        <div className={styles['playlist-drawer__controls']}>
          <MuzaButton
            onClick={() => {}}
            className={styles['playlist-drawer__sort-button']}
            content={t('playlist.sort')}
            iconName='ArrowUpDown'
          />

          <MuzaInputField
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t('playlist.filterPlaceholder')}
            className={styles['playlist-drawer__search-input']}
            leadingIcon='search'
            name='playlist-drawer-search-input'
          />
        </div>

        <div className={styles['playlist-drawer__song-list']}>
          {/* Main drop zone - always visible at the top */}
          <div
            className={`${styles['playlist-drawer__drop-zone']} ${isDragOver ? styles['playlist-drawer__drop-zone--active'] : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <span>{t('playlist.dropSongsHere')}</span>
          </div>

          {/* Display current playlist songs below the drop zone */}
          {playlist?.songs && playlist.songs.length > 0 && (
            <div className={styles['playlist-drawer__songs']}>
              {playlist.songs.map((song, index) => (
                <div key={song.id || index} className={styles['playlist-drawer__song-item']}>
                  <SongLineWithCover
                    details={{ ...song, index: index + 1 }}
                    onClick={() => {}}
                    isPlaying={false}
                    showHoverActions={false}
                    playlistMode={true}
                    draggable={isOpen}
                    onRemoveSong={removeSongFromPlaylist}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PlaylistDrawer
