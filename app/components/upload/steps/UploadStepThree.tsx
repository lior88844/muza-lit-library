import type { FC } from 'react'
import type { MiniAlbum } from 'server/api/album/types/MiniAlbumResponse'
import type { TrackResponse } from 'server/api/track/types/TrackResponse'
import { EntityTypeEnum } from 'server/db/stack.entity'

import MediaHeader from '~/components/MediaHeader'
import TrackPreview from '~/components/songLineDisplays/TrackPreview'
import { Divider } from '~/components/ui/divider'
import { usePlayerStore } from '~/store/playerStore'
import type { TrackMetadata, UploadFormData } from '~/store/uploadStore'

interface UploadStepThreeProps {
  formData: UploadFormData
  trackMetadata: TrackMetadata[]
  coverImage: File | null
  onSave?: () => void
  onPublish?: () => void
}

const UploadStepThree: FC<UploadStepThreeProps> = ({ formData, trackMetadata, coverImage }) => {
  const { currentTrack, playPause, playQueue } = usePlayerStore()

  const getCoverImageUrl = () => {
    if (coverImage) {
      return URL.createObjectURL(coverImage)
    }
    return '/art/muza.png' // Fallback image
  }

  // Transform upload data into Album format
  const transformToAlbum = (): MiniAlbum => {
    return {
      id: Date.now(),
      imageSrc: getCoverImageUrl(),
      artistId: 0,
      title: formData.albumTitle || 'Untitled Album',
      releaseDate: new Date(formData.recordingDate),
      artist: formData.mainArtist || 'Unknown Artist',
      songs: trackMetadata.map((_, index) => index + 1),
    }
  }

  // Transform track metadata into SongDetails format
  const transformToSongDetails = (): TrackResponse[] => {
    return trackMetadata.map((track, index) => {
      // Parse duration string to seconds
      const parseDuration = (durationStr: string): number => {
        if (!durationStr || durationStr === '0:00') return 0
        const parts = durationStr.split(':')
        if (parts.length === 2) {
          const minutes = parseInt(parts[0]) || 0
          const seconds = parseInt(parts[1]) || 0
          return minutes * 60 + seconds
        }
        return 0
      }

      return {
        id: Date.now(),
        index: index + 1,
        title: track.songName || 'Untitled',
        artist: track.composer || formData.mainArtist || 'Unknown Artist',
        album: formData.albumTitle || 'Untitled Album',
        time: parseDuration(track.duration),
        year: new Date().getFullYear(),
        imageSrc: getCoverImageUrl(),
        audioUrl: track.file ? URL.createObjectURL(track.file) : '',
        artistId: 0,
        albumId: 0,
        playCount: 0,
      }
    })
  }

  const album = transformToAlbum()
  const songDetails = transformToSongDetails()
  const onTogglePlay = (song: TrackResponse) => {
    if (currentTrack?.id === song.id) {
      playPause()
    } else {
      playQueue({ items: [song], startIndex: 0 })
    }
  }
  return (
    <div className='w-full'>
      <div className='mx-auto px-[60px] py-6'>
        <MediaHeader
          songs={songDetails}
          mediaType={EntityTypeEnum.Album}
          entityId={album.id}
          title={album.title}
          imageSrc={album.imageSrc || ''}
          mediaMetadata={{
            songCount: songDetails.length,
            year: album.releaseDate?.getFullYear(),
          }}
          creator={album.artist}
          showBackButton={false}
          customActions={<div></div>}
        />

        <Divider />

        <div className='mt-4 mb-4 flex flex-1 flex-col gap-0 gap-x-2'>
          {songDetails.map((song: TrackResponse) => (
            <TrackPreview key={song.id} track={song} onClick={onTogglePlay} albumMode />
          ))}
        </div>
      </div>
    </div>
  )
}

export default UploadStepThree
