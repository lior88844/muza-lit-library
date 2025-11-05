import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import SongLineWithCover from '~/components/songLineDisplays/SongLineWithCover'
import MuzaButton from '~/controls/MuzaButton'
import MuzaInputField from '~/controls/MuzaInputField'
import MuzaIcon from '~/icons/MuzaIcon'
import { useCurrentPlayerStore } from '~/store/currentPlayerStore'
import { useMedia } from '~/store/media/mediaContext'
import type { SongDetails } from '~/store/models'

import { PlaylistVisibilityEnum } from '../../../server/db/playlist.entity'
import { useUpdatePlaylist } from '../../store/media/useUpdatePlaylist'
import styles from './PlaylistDrawer.module.css'

interface PlaylistDrawerProps {
  isOpen: boolean
  onClose: () => void
}

const PlaylistDrawer: React.FC<PlaylistDrawerProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { songs: allSongs, playlists } = useMedia()

  // Get playlist from context
  const currentPlaylistDrawerId = useCurrentPlayerStore(state => state.currentPlaylistDrawerId)
  const playlist = playlists.find(p => p.id === currentPlaylistDrawerId)
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
    // Only set isDragOver to false if we're actually leaving the content area
    // not just moving between child elements
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY

    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setIsDragOver(false)
    }
  }, [])

  // Helper function for adding songs to playlist
  const handleAddSongs = useCallback(
    (songsToAdd: SongDetails[]) => {
      if (!playlist?.id) return

      // Filter out songs that already exist in the playlist
      const newSongs = songsToAdd.filter(
        song =>
          !playlist.songs?.some(
            existingSong =>
              existingSong.id === song.id ||
              (existingSong.title === song.title && existingSong.artist === song.artist)
          )
      )

      if (newSongs.length === 0) return

      // Add songs at the start and re-index
      const updatedSongs = [...newSongs, ...(playlist.songs || [])].map((song, idx) => ({
        ...song,
        index: idx + 1,
      }))

      updatePlaylist(playlist.id, {
        songs: updatedSongs,
      })
    },
    [playlist, updatePlaylist]
  )

  // Helper function for removing songs from playlist
  const removeSongFromPlaylist = useCallback(
    (songToRemove: SongDetails) => {
      if (!playlist?.id) return

      // Filter out the removed song and re-index remaining songs
      const updatedSongs =
        playlist.songs
          ?.filter(song => song.id !== songToRemove.id)
          .map((song, idx) => ({
            ...song,
            index: idx + 1,
          })) || []

      updatePlaylist(playlist.id, {
        songs: updatedSongs,
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

          // Handle songs
          if (data.type === 'song' && data.song) {
            handleAddSongs([data.song])
          }

          // Handle albums
          if (data.type === 'album' && data.album) {
            let tracksToAdd: SongDetails[] = []

            // Case 1: Album has full track details (from album detail page)
            if (
              data.album.tracks &&
              Array.isArray(data.album.tracks) &&
              data.album.tracks.length > 0
            ) {
              // Check if tracks are full SongDetails or just IDs
              if (typeof data.album.tracks[0] === 'object' && 'title' in data.album.tracks[0]) {
                tracksToAdd = data.album.tracks as SongDetails[]
              }
            }
            // Case 2: Album only has song IDs (from homepage)
            else if (
              data.album.songs &&
              Array.isArray(data.album.songs) &&
              data.album.songs.length > 0
            ) {
              // Resolve song IDs to full song details
              tracksToAdd = data.album.songs
                .map((songId: number) => allSongs.find((song: SongDetails) => song.id === songId))
                .filter((song: SongDetails | undefined): song is SongDetails => song !== undefined)
            }

            // Add all tracks from the album at once
            if (tracksToAdd.length > 0) {
              handleAddSongs(tracksToAdd)
            }
          }
        } catch {
          // Silently handle parsing errors
        }
      }
    },
    [handleAddSongs, allSongs]
  )

  // Note: handleSave is not used in the current UI
  // Playlist updates happen automatically through onSavePlaylist in add/remove song functions

  const handleClose = useCallback(() => {
    if (!playlist?.id) {
      onClose()
      return
    }

    // Check if there are any changes to save
    const nameChanged = playlistName !== playlist.title
    const descriptionChanged = playlistDescription !== (playlist.description || '')

    if (nameChanged || descriptionChanged) {
      // Update the playlist with the new name and/or description
      const updates: { name?: string; description?: string } = {}
      if (nameChanged && playlistName.trim()) {
        updates.name = playlistName.trim()
      }
      if (descriptionChanged) {
        updates.description = playlistDescription
      }

      // This will optimistically update the UI and save to backend
      updatePlaylist(playlist.id, updates)
    }

    onClose()
  }, [playlist, playlistName, playlistDescription, updatePlaylist, onClose])

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

      <div
        className={styles['playlist-drawer__content']}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
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
          {!playlist?.songs.length && (
            <div
              className={`${styles['playlist-drawer__drop-zone']} ${isDragOver ? styles['playlist-drawer__drop-zone--active'] : ''}`}
            >
              <span>{t('playlist.dropSongsHere')}</span>
            </div>
          )}

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
