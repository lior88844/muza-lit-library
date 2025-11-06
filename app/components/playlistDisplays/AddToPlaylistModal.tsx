import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import MuzaIcon from '~/icons/MuzaIcon'
import { cn } from '~/lib/utils'
import { useMedia } from '~/store/media/mediaContext'
import type { MusicPlaylist, SongDetails } from '~/store/models'

import { PlaylistVisibilityEnum } from '../../../server/db/playlist.entity'
import { useAddAlbumToPlaylist } from '../../store/media/useAddAlbumToPlaylist'
import { useAddPlaylist } from '../../store/media/useAddPlaylist'
import { IconButton } from '../ui/button/icon-button'
import CreatePlaylistModal from '../ui/CreatePlaylistModal'

interface AddToPlaylistModalProps {
  isOpen: boolean
  onClose: () => void
  albumTracks: SongDetails[]
  albumTitle: string
}

const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({
  isOpen,
  onClose,
  albumTracks,
  albumTitle,
}) => {
  const { t } = useTranslation()
  const { playlists } = useMedia()
  const { addAlbumToPlaylist, loading } = useAddAlbumToPlaylist()
  const { addPlaylist } = useAddPlaylist()
  const [isCreatePlaylistModalOpen, setIsCreatePlaylistModalOpen] = useState(false)

  const handlePlaylistClick = async (playlist: MusicPlaylist) => {
    const result = await addAlbumToPlaylist(playlist.id, albumTracks)
    if (result) {
      onClose()
    }
  }

  const handleCreateNewPlaylist = () => {
    // Close the AddToPlaylistModal and open CreatePlaylistModal
    onClose()
    setIsCreatePlaylistModalOpen(true)
  }

  const handleCreatePlaylistSubmit = async (name: string, visibility: PlaylistVisibilityEnum) => {
    await addPlaylist(name, visibility)
    setIsCreatePlaylistModalOpen(false)
    // Continue with normal flow - the useAddPlaylist hook will handle opening the playlist drawer
  }

  const formatDuration = (songs: SongDetails[]) => {
    const totalSeconds = songs.reduce((total, song) => total + (song.time || 0), 0)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    return `${hours}h ${minutes}m ${seconds}s`
  }

  return (
    <>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className='fixed inset-0 z-[1100] bg-black/50 backdrop-blur-sm'
            onClick={onClose}
            aria-hidden='true'
          />

          {/* Modal */}
          <div className='fixed left-1/2 top-1/2 z-[1100] w-full max-w-[600px] -translate-x-1/2 -translate-y-1/2'>
        <div className='flex flex-col gap-4 rounded-lg border border-border bg-background p-6 shadow-lg'>
          {/* Header */}
          <div className='flex flex-col gap-1.5'>
            <p className='text-xl font-semibold leading-none text-foreground'>
              {t('playlist.addToPlaylist')}
            </p>
          </div>

          {/* Playlist List */}
          <div className='flex flex-col gap-5.5'>
            <div className='flex h-[417px] items-start justify-between'>
              {/* Playlist Items */}
              <div className='flex max-h-[417px] flex-1 flex-col gap-2 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-muted [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-input'>
                {playlists.map(playlist => (
                  <button
                    key={playlist.id}
                    onClick={() => handlePlaylistClick(playlist)}
                    disabled={loading}
                    className={cn(
                      'flex h-14 cursor-pointer items-center gap-2 rounded-md bg-background px-2 py-1.5 transition-colors hover:bg-muted',
                      loading && 'cursor-not-allowed opacity-50'
                    )}
                  >
                    {/* Playlist Cover */}
                    <div className='flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-sm shadow-sm'>
                      {playlist.imageSrc ? (
                        <img
                          src={playlist.imageSrc}
                          alt={playlist.title}
                          className='h-full w-full object-cover'
                        />
                      ) : (
                        <div className='flex h-full w-full items-center justify-center bg-muted'>
                          <MuzaIcon iconName='ListMusic' className='h-5 w-5 text-muted-foreground' />
                        </div>
                      )}
                    </div>

                    {/* Playlist Info */}
                    <div className='flex flex-1 flex-col items-start gap-1'>
                      <p className='overflow-hidden text-ellipsis whitespace-nowrap text-base font-medium leading-5 text-foreground'>
                        {playlist.title}
                      </p>
                      <div className='flex items-center gap-1 whitespace-pre text-base leading-none text-muted-foreground'>
                        <span>{playlist.songs?.length || 0} Songs</span>
                        <span>•</span>
                        <span>{formatDuration(playlist.songs || [])}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* New Playlist Button */}
          <div className='flex items-start justify-end gap-4'>
            <button
              onClick={handleCreateNewPlaylist}
              disabled={loading}
              className='flex h-9 cursor-pointer items-center gap-2 rounded-full bg-secondary px-4 py-2.5 transition-colors hover:bg-(--muza-toggle-active-color) hover:text-white disabled:cursor-not-allowed disabled:opacity-50'
            >
              <div className='flex h-4 w-4 items-center justify-center overflow-hidden'>
                <MuzaIcon iconName='plus' className='h-4 w-4' />
              </div>
              <span className='whitespace-nowrap text-base font-medium leading-none text-secondary-foreground'>
                {t('playlist.newPlaylist')}
              </span>
            </button>
          </div>

          {/* Close Button */}
          <IconButton
            icon={<MuzaIcon iconName='Close' />}
            variant='ghost'
            onClick={onClose}
            className='absolute right-4 top-4'
            aria-label='Close'
          />
        </div>
      </div>
        </>
      )}

      {/* Create Playlist Modal - Render outside AddToPlaylistModal so it persists when AddToPlaylistModal closes */}
      {isCreatePlaylistModalOpen && (
        <CreatePlaylistModal
          isOpen={isCreatePlaylistModalOpen}
          onClose={() => setIsCreatePlaylistModalOpen(false)}
          onCreatePlaylist={handleCreatePlaylistSubmit}
        />
      )}
    </>
  )
}

export default AddToPlaylistModal


