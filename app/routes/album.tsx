import '../styles/variables.css'

import { useState } from 'react'
import { useLoaderData } from 'react-router'
import { EntityTypeEnum } from 'server/db/stack.entity'

import MediaHeader from '~/components/MediaHeader'
import SongLine from '~/components/songLineDisplays/SongLine'
import { useCurrentPlayerStore } from '~/store/currentPlayerStore'

import { fetchAlbumById } from '../../server/root.service'
import AlbumInfoModal from '../components/albumDisplays/AlbumInfoModal'
import AddToPlaylistModal from '../components/playlistDisplays/AddToPlaylistModal'

export async function loader({ params }: { params: { id: string } }) {
  const albumId = parseInt(params.id, 10)

  if (isNaN(albumId)) {
    throw new Error('Invalid album ID')
  }

  try {
    const albumData = await fetchAlbumById(albumId)

    if (!albumData) {
      throw new Error('Album not found')
    }

    return { album: albumData }
  } catch {
    throw new Error('Failed to load album')
  }
}

export default function AlbumPage() {
  const {
    selectedSong,
    setSelectedSong,
    setIsPlaying,
    isPlaying,
    togglePlayPause,
    isPlaylistDrawerOpen,
  } = useCurrentPlayerStore()
  const [isModalOpen, setModalOpen] = useState(false)
  const [isAddToPlaylistModalOpen, setAddToPlaylistModalOpen] = useState(false)
  const { album } = useLoaderData<typeof loader>()

  return (
    <>
      <MediaHeader
        title={album.title}
        imageSrc={album.coverArt || ''}
        creator={album.artist.name}
        mediaMetadata={{
          year: album.releaseDate?.getFullYear(),
          songCount: album.tracks?.length,
        }}
        onInfoClick={() => setModalOpen(true)}
        onAddToPlaylistClick={() => setAddToPlaylistModalOpen(true)}
        songs={album.tracks}
        mediaType={EntityTypeEnum.Album}
        entityId={album.id}
        showBackButton={true}
      />
      <div>
        {album.tracks.map(({ album: _, ...track }) => {
          return (
            <SongLine
              key={track.id}
              details={track}
              onClick={() => {
                if (selectedSong?.id === track.id) {
                  togglePlayPause()
                } else {
                  setSelectedSong(track)
                  setIsPlaying(true)
                }
              }}
              isPlaying={track.id === selectedSong?.id && !!isPlaying}
              draggable={isPlaylistDrawerOpen}
            />
          )
        })}
      </div>
      <AlbumInfoModal album={album} isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
      <AddToPlaylistModal
        isOpen={isAddToPlaylistModalOpen}
        onClose={() => setAddToPlaylistModalOpen(false)}
        albumTracks={album.tracks}
        albumTitle={album.title}
      />
    </>
  )
}
