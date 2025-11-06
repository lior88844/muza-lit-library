import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useFetcher, useNavigate } from 'react-router'

import SongLineWithCover from '~/components/songLineDisplays/SongLineWithCover'
import { IconButton } from '~/components/ui/button/icon-button'
import MuzaIcon from '~/icons/MuzaIcon'
import { cn } from '~/lib/utils'
import { useCurrentPlayerStore } from '~/store/currentPlayerStore'
import { useMedia } from '~/store/media/mediaContext'
import type { SongDetails } from '~/store/models'

import { PlaylistVisibilityEnum } from '../../../server/db/playlist.entity'
import { useUpdatePlaylist } from '../../store/media/useUpdatePlaylist'

interface PlaylistDrawerProps {
  isOpen: boolean
  onClose: () => void
}

const PlaylistDrawer: React.FC<PlaylistDrawerProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const fetcher = useFetcher<{ album: { tracks: SongDetails[] } }>()
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
  const [pendingAlbumId, setPendingAlbumId] = useState<number | null>(null)
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

  // Handle when album data is fetched
  useEffect(() => {
    if (fetcher.data && fetcher.data.album && pendingAlbumId) {
      const tracks = fetcher.data.album.tracks
      if (tracks && tracks.length > 0) {
        handleAddSongs(tracks)
      }
      setPendingAlbumId(null)
    }
  }, [fetcher.data, pendingAlbumId, handleAddSongs])

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
            // Case 2: Album only has song IDs (from homepage/explore)
            else if (
              data.album.songs &&
              Array.isArray(data.album.songs) &&
              data.album.songs.length > 0
            ) {
              // Try to resolve song IDs from local songs first
              tracksToAdd = data.album.songs
                .map((songId: number) => allSongs.find((song: SongDetails) => song.id === songId))
                .filter((song: SongDetails | undefined): song is SongDetails => song !== undefined)

              // If no songs found locally, fetch the full album from server using React Router
              if (tracksToAdd.length === 0 && data.album.id) {
                setPendingAlbumId(data.album.id)
                fetcher.load(`/albums/${data.album.id}`)
                return // Wait for fetcher to load the data
              }
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
    [handleAddSongs, allSongs, fetcher]
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

  // Filter songs based on search query
  const filteredSongs = React.useMemo(() => {
    if (!playlist?.songs) return []

    if (!searchQuery.trim()) {
      return playlist.songs
    }

    const query = searchQuery.toLowerCase().trim()
    return playlist.songs.filter(song => {
      const titleMatch = song.title?.toLowerCase().includes(query)
      const artistMatch = song.artist?.toLowerCase().includes(query)
      const albumMatch = song.album?.toLowerCase().includes(query)

      return titleMatch || artistMatch || albumMatch
    })
  }, [playlist?.songs, searchQuery])

  return (
    <div
      className={cn(
        'bg-background fixed top-0 right-0 z-[99] flex h-screen w-[374px] flex-col border-l border-(--muza-light-border-color) shadow-[-4px_0_16px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-in-out',
        'pt-[var(--muza-topbar-height,64px)]',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )}
    >
      {/* Header */}
      <div className='bg-background flex items-center justify-between gap-2 border-b border-(--muza-light-border-color) px-4 py-2'>
        <div className='flex items-center gap-2'>
          <div className='bg-secondary flex items-center gap-1 rounded-sm border border-transparent px-2 py-0.5'>
            <div className='flex h-3 w-3 items-center justify-center'>
              <MuzaIcon iconName='ListMusic' />
            </div>
            <span className='text-sm leading-none font-normal whitespace-nowrap text-[var(--muza-primary-text-color)]'>
              {t('playlist.playlist')}
            </span>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <IconButton
            variant='outline'
            icon={<MuzaIcon iconName='ellipsis' />}
            onClick={handleClose}
            className='bg-background/50 size-9 border-[0.66px] border-(--muza-light-border-color) backdrop-blur-lg'
          />
          <IconButton
            variant='outline'
            icon={<MuzaIcon iconName='MoveDiagonal' />}
            onClick={handleNavigateToPlaylist}
            className='bg-background/50 size-9 border-[0.66px] border-(--muza-light-border-color) backdrop-blur-lg'
          />
          <IconButton
            variant='outline'
            icon={<MuzaIcon iconName='Close' />}
            onClick={handleClose}
            className='bg-background/50 size-9 border-[0.66px] border-(--muza-light-border-color) backdrop-blur-lg'
          />
        </div>
      </div>

      {/* Content */}
      <div
        className='flex flex-1 flex-col gap-4 overflow-y-auto px-4'
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Playlist Info */}
        <div className='flex flex-col gap-2 pt-4'>
          <div className='flex flex-col gap-2'>
            <input
              type='text'
              value={playlistName}
              onChange={e => setPlaylistName(e.target.value)}
              placeholder={t('playlist.enterName')}
              className='text-foreground placeholder:text-muted-foreground border-none bg-transparent p-0 text-2xl leading-7 font-semibold outline-none'
              style={{
                fontFamily:
                  "var(--typography_font_family_font_sans, 'Founders Grotesk'), sans-serif",
              }}
            />
            <input
              type='text'
              value={playlistDescription}
              onChange={e => setPlaylistDescription(e.target.value)}
              placeholder={t('playlist.enterDescription')}
              className='text-muted-foreground placeholder:text-muted-foreground border-none bg-transparent p-0 text-base leading-6 outline-none'
              style={{
                fontFamily:
                  "var(--typography_font_family_font_sans, 'Founders Grotesk'), sans-serif",
              }}
            />
          </div>

          <div className='mt-4 flex gap-1'>
            <div className='bg-background/50 flex items-center gap-1 rounded-sm border-[0.5px] border-(--muza-light-border-color) px-2 py-0.5 backdrop-blur-lg'>
              <div className='flex h-3 w-3 items-center justify-center'>
                <MuzaIcon iconName='globe' />
              </div>
              <span className='text-foreground text-sm leading-none font-normal whitespace-nowrap'>
                {isPublic ? t('playlist.public') : t('playlist.private')}
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className='flex items-stretch gap-2'>
          <button
            onClick={() => {}}
            className='bg-background/50 hover:bg-background/70 flex h-9 w-fit items-center gap-2 rounded-full border border-(--muza-light-border-color) px-4 py-2 backdrop-blur-lg transition-colors'
          >
            <div className='flex h-4 w-4 items-center justify-center'>
              <MuzaIcon iconName='ArrowUpDown' />
            </div>
            <span
              className='text-foreground text-base leading-5 font-medium whitespace-nowrap'
              style={{
                fontFamily:
                  "var(--typography_font_family_font_sans, 'Founders Grotesk'), sans-serif",
              }}
            >
              {t('playlist.sort')}
            </span>
          </button>

          <div className='relative flex flex-1 items-center'>
            <div className='pointer-events-none absolute left-3 flex h-4 w-4 items-center justify-center'>
              <MuzaIcon iconName='search' />
            </div>
            <input
              type='text'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('playlist.filterPlaceholder')}
              className='border-input bg-background text-muted-foreground placeholder:text-muted-foreground h-9 w-full rounded-full border px-3 py-1.5 pl-10 text-sm leading-5 outline-none focus:border-(--muza-toggle-active-color)'
              style={{
                fontFamily:
                  "var(--typography_font_family_font_sans, 'Founders Grotesk'), sans-serif",
              }}
            />
          </div>
        </div>

        {/* Song List */}
        <div className='flex flex-1 flex-col gap-2 pb-4'>
          {/* Main drop zone */}
          <div
            className={cn(
              'flex h-14 items-center justify-center rounded bg-(--colors_muted_light) px-2 py-1 transition-all',
              isDragOver && 'border-foreground border'
            )}
          >
            <span className='text-muted-foreground text-sm leading-4 font-normal'>
              {t('playlist.dropSongsHere')}
            </span>
          </div>

          {/* Display current playlist songs */}
          {playlist?.songs && playlist.songs.length > 0 && (
            <div className='mt-4 flex flex-col gap-1'>
              {filteredSongs.length > 0 ? (
                filteredSongs.map((song, index) => (
                  <div key={song.id || index} className='hover:bg-hover rounded transition-colors'>
                    <SongLineWithCover
                      details={{ ...song, index: index + 1 }}
                      onClick={() => {}}
                      isPlaying={false}
                      showHoverActions={false}
                      playlistMode={true}
                      draggable={false}
                      onRemoveSong={removeSongFromPlaylist}
                    />
                  </div>
                ))
              ) : (
                <div className='flex flex-col items-center justify-center gap-2 py-8'>
                  <MuzaIcon iconName='search' />
                  <span className='text-muted-foreground text-sm'>
                    {t('playlist.noSongsFound')}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PlaylistDrawer
