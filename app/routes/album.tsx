import '../styles/variables.css'

import { useMemo, useState } from 'react'
import { useLoaderData } from 'react-router'

import MediaHeader from '~/components/MediaHeader'
import SongLine from '~/components/songLineDisplays/SongLine'
import { useCurrentPlayerStore } from '~/store/currentPlayerStore'
import { useMedia } from '~/store/media/mediaContext'
import type { SongDetails } from '~/store/models'

import { fetchAlbumById } from '../../server/data'
import { MediaTypeEnum } from '../../server/db/user-library.entity'
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
  const { selectedSong, setSelectedSong, setIsPlaying, isPlaying, togglePlayPause } =
    useCurrentPlayerStore()
  const library = useMedia()
  const songs = library.songs
  const [isModalOpen, setModalOpen] = useState(false)
  const { album } = useLoaderData<typeof loader>()

  const albumSongs = useMemo(
    () =>
      album.tracks
        ?.map(track => songs.find((s: SongDetails) => s.id === track.id))
        .filter(v => v !== undefined) || [],
    [album.tracks, songs]
  )

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
        songs={albumSongs}
        mediaType={MediaTypeEnum.Album}
        resourceId={album.id}
        showBackButton={true}
      />
      <div>
        {album.tracks.map(track => {
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
            />
          )
        })}
      </div>
      <AlbumInfoModal album={album} isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
