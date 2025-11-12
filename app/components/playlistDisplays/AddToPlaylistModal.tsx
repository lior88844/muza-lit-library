import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

import MuzaIcon from '~/icons/MuzaIcon'
import { generatePlaylistCoverImages } from '~/lib/utils'
import { useMedia } from '~/store/media/mediaContext'
import type { SongDetails } from '~/store/models'

import { PlaylistVisibilityEnum } from '../../../server/db/playlist.entity'
import { useAddPlaylist } from '../../store/media/useAddPlaylist'
import { useUpdatePlaylist } from '../../store/media/useUpdatePlaylist'
import { Button } from '../ui/button'
import CreatePlaylistModal from '../ui/CreatePlaylistModal'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog/dialog-primitives'

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
  const { updatePlaylist, loading } = useUpdatePlaylist()
  const { addPlaylist } = useAddPlaylist()
  const [isCreatePlaylistModalOpen, setIsCreatePlaylistModalOpen] = useState(false)

  const handlePlaylistClick = async (playlistId: number) => {
    const playlist = playlists.find(p => p.id === playlistId)
    if (!playlist) {
      toast.error('Playlist not found', {
        position: 'bottom-center',
        hideProgressBar: true,
      })
      return
    }

    const existingSongs = playlist.songs || []

    // Filter out tracks that already exist in the playlist
    const newTracks = albumTracks.filter(
      track =>
        !existingSongs.some(
          existingSong =>
            existingSong.id === track.id ||
            (existingSong.title === track.title && existingSong.artist === track.artist)
        )
    )

    if (newTracks.length === 0) {
      toast.info('All tracks from this album are already in the playlist', {
        position: 'bottom-center',
        hideProgressBar: true,
        autoClose: 2000,
      })
      onClose()
      return
    }

    // Add new tracks at the end and reindex
    const updatedSongs = [...existingSongs, ...newTracks].map((song, idx) => ({
      ...song,
      index: idx + 1,
    }))

    const result = await updatePlaylist(playlistId, {
      songs: updatedSongs,
    })

    if (result && result.success) {
      // Show success toast with revoke button
      const addedTrackIds = newTracks.map(t => t.id)

      toast(
        <div className='flex items-center gap-2'>
          <div className='flex flex-1 flex-col gap-1'>
            <p className='font-semibold text-foreground'>{t('playlist.albumAdded')}</p>
            <p className='text-sm text-muted-foreground opacity-90'>
              {t('playlist.albumAddedToPlaylist')}
            </p>
          </div>
          <button
            onClick={() => {
              // Remove the added tracks from the playlist
              const songsWithoutAdded = updatedSongs.filter(
                song => !addedTrackIds.includes(song.id)
              )
              const reindexedSongs = songsWithoutAdded.map((song, idx) => ({
                ...song,
                index: idx + 1,
              }))

              // Update playlist to remove added tracks
              updatePlaylist(playlistId, {
                songs: reindexedSongs,
              })

              toast.dismiss()
              toast(t('playlist.albumRevoked'), {
                position: 'bottom-center',
                hideProgressBar: true,
                autoClose: 1000,
              })
            }}
            className='flex h-9 items-center justify-center rounded-full border-[0.66px] border-border bg-background/50 px-4 py-2 backdrop-blur-lg transition-colors hover:bg-background/70'
          >
            <span className='whitespace-nowrap text-base font-medium leading-none text-foreground'>
              {t('playlist.revoke')}
            </span>
          </button>
        </div>,
        {
          position: 'bottom-center',
          hideProgressBar: true,
          autoClose: 5000,
          closeButton: false,
        }
      )

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
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className='w-full max-w-[600px]'
          CloseButtonContent={<MuzaIcon iconName='Close' />}
        >
          <DialogHeader>
            <DialogTitle className='text-xl'>{t('playlist.addToPlaylist')}</DialogTitle>
          </DialogHeader>

          {/* Playlist Items */}
          <div className='flex max-h-[417px] flex-1 flex-col gap-2 overflow-x-hidden overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-muted [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-input'>
            {playlists.map(playlist => {
              const coverImages = generatePlaylistCoverImages(playlist)
              const isEmpty = coverImages === null

              return (
                <Button
                  key={playlist.id}
                  onClick={() => handlePlaylistClick(playlist.id)}
                  disabled={loading}
                  variant='ghost'
                  className='flex h-14 w-full justify-start gap-2 rounded-[6px] px-2 py-1.5'
                >
                  {/* Playlist Cover */}
                  <div className='relative h-11 w-11 shrink-0 overflow-hidden rounded-sm shadow-sm'>
                    {isEmpty ? (
                      <div className='flex h-full w-full items-center justify-center bg-muted'>
                        <MuzaIcon iconName='ListMusic' className='h-5 w-5 text-muted-foreground' />
                      </div>
                    ) : (
                      <div className='grid h-full w-full grid-cols-2 grid-rows-2'>
                        <div
                          className='h-full w-full bg-cover bg-center bg-no-repeat'
                          style={{ backgroundImage: `url('${coverImages[0]}')` }}
                        />
                        <div
                          className='h-full w-full bg-cover bg-center bg-no-repeat'
                          style={{ backgroundImage: `url('${coverImages[1]}')` }}
                        />
                        <div
                          className='h-full w-full bg-cover bg-center bg-no-repeat'
                          style={{ backgroundImage: `url('${coverImages[2]}')` }}
                        />
                        <div
                          className='h-full w-full bg-cover bg-center bg-no-repeat'
                          style={{ backgroundImage: `url('${coverImages[3]}')` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Playlist Info */}
                  <div className='flex min-w-0 flex-1 flex-col items-start gap-1'>
                    <p className='w-full overflow-hidden text-ellipsis whitespace-nowrap text-left text-base font-medium leading-5 text-foreground'>
                      {playlist.title}
                    </p>
                    <div className='flex items-center gap-1 whitespace-pre text-base leading-none text-muted-foreground'>
                      <span>{playlist.songs?.length || 0} Songs</span>
                      <span>•</span>
                      <span>{formatDuration(playlist.songs || [])}</span>
                    </div>
                  </div>
                </Button>
              )
            })}
          </div>

          {/* New Playlist Button */}
          <div className='flex justify-end'>
            <Button
              onClick={handleCreateNewPlaylist}
              disabled={loading}
              variant='secondary'
              iconStart={<MuzaIcon iconName='plus' className='h-4 w-4' />}
            >
              {t('playlist.newPlaylist')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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


