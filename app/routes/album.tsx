import '../styles/variables.css'

import { useState } from 'react'
import { useLoaderData } from 'react-router'
import { EntityTypeEnum } from 'server/db/stack.entity'

import MediaHeader from '~/components/MediaHeader'
import SongLine from '~/components/songLineDisplays/SongLine'
import { useDrawerStore } from '~/store/drawerStore'
import { usePlayerStore } from '~/store/playerStore'

import { fetchAlbumById } from '../../server/root.service'
import AlbumInfoModal from '../components/albumDisplays/AlbumInfoModal'

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
    current,
    playQueue,
    isPlaying,
    playPause,
  } = usePlayerStore()
  const { isPlaylistDrawerOpen } = useDrawerStore()
  const [isModalOpen, setModalOpen] = useState(false)
  const { album } = useLoaderData<typeof loader>()

  const handleSongClick = (trackId: number, index: number) => {
    if (current?.id === trackId) {
      // Same song - toggle play/pause
      playPause()
    } else {
      // New song - load entire album as queue
      // Add album property to each track for the queue
      const tracksWithAlbum = album.tracks.map(track => ({
        ...track,
        album: album.title,
      }))
      
      playQueue({
        items: tracksWithAlbum,
        startIndex: index,
        source: {
          type: 'album',
          id: album.id,
          title: album.title,
        },
      })
    }
  }

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
        songs={album.tracks}
        mediaType={EntityTypeEnum.Album}
        entityId={album.id}
        showBackButton={true}
      />
      <div>
        {album.tracks.map(({ album: _, ...track }, index) => {
          return (
            <SongLine
              key={track.id}
              details={track}
              onClick={() => handleSongClick(track.id, index)}
              isPlaying={track.id === current?.id && !!isPlaying}
              draggable={isPlaylistDrawerOpen}
            />
          )
        })}
      </div>
      <AlbumInfoModal album={album} isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
