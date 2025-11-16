import '../styles/variables.css'

import { useEffect, useRef, useState } from 'react'
import { useLoaderData, useLocation } from 'react-router'
import type { AlbumResponse } from 'server/api/album/types/AlbumResponse'
import { EntityTypeEnum } from 'server/db/stack.entity'

import { AlbumInfoModal } from '~/components/albumDisplays/album-info-modal'
import MediaHeader from '~/components/MediaHeader'
import AddToPlaylistModal from '~/components/playlistDisplays/AddToPlaylistModal'
import TrackPreview from '~/components/songLineDisplays/TrackPreview'
import { useDrawerStore } from '~/store/drawerStore'
import { usePlayerStore } from '~/store/playerStore'

import { fetchAlbumById } from '../../server/root.service'

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

    return albumData
  } catch {
    throw new Error('Failed to load album')
  }
}

export default function AlbumPage() {
  const { currentTrack, playQueue, playPause } = usePlayerStore()
  const { isPlaylistDrawerOpen } = useDrawerStore()
  const [isModalOpen, setModalOpen] = useState(false)
  const [isAddToPlaylistModalOpen, setAddToPlaylistModalOpen] = useState(false)
  const album: AlbumResponse = useLoaderData<typeof loader>()
  const location = useLocation()
  const trackId = location.state?.trackId ? parseInt(location.state.trackId, 10) : undefined
  const trackIndex = trackId ? album.tracks.findIndex(track => track.id === trackId) : undefined
  const hasAutoPlayed = useRef(false)

  useEffect(() => {
    // Only autoplay once when trackId is in location state (from navigation)
    if (trackId && trackIndex !== undefined && trackIndex !== -1 && !hasAutoPlayed.current) {
      hasAutoPlayed.current = true
      playQueue({
        items: album.tracks,
        startIndex: trackIndex,
        source: { type: EntityTypeEnum.Album, id: album.id, title: album.title },
      })
      history.replaceState(null, '', location.pathname)
    }
  }, [trackId, trackIndex, album.tracks, album.id, album.title, playQueue, location.pathname])

  const handleSongClick = (trackId: number, index: number) => {
    if (currentTrack?.id === trackId) {
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
          type: EntityTypeEnum.Album,
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
        onAddToPlaylistClick={() => setAddToPlaylistModalOpen(true)}
        songs={album.tracks}
        mediaType={EntityTypeEnum.Album}
        entityId={album.id}
        showBackButton={true}
      />
      <div>
        {album.tracks.map((track, index) => {
          return (
            <TrackPreview
              key={track.id}
              track={track}
              albumMode
              onClick={() => handleSongClick(track.id, index)}
              draggable={isPlaylistDrawerOpen}
            />
          )
        })}
      </div>
      <AlbumInfoModal album={album} isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
      <AddToPlaylistModal
        isOpen={isAddToPlaylistModalOpen}
        onClose={() => setAddToPlaylistModalOpen(false)}
        tracksToAdd={album.tracks}
      />
    </>
  )
}
