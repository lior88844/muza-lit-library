import type { FC } from 'react'

import MediaHeader from '~/components/MediaHeader'
import SongLine from '~/components/songLineDisplays/SongLine'
import { useCurrentPlayerStore } from '~/store/currentPlayerStore'
import type { Album, SongDetails } from '~/store/models'
import type { TrackMetadata, UploadFormData } from '~/store/uploadStore'

import { MediaTypeEnum } from '../../../../server/db/user-library.entity'

interface UploadStepThreeProps {
  formData: UploadFormData
  trackMetadata: TrackMetadata[]
  coverImage: File | null
  onSave?: () => void
  onPublish?: () => void
}

const UploadStepThree: FC<UploadStepThreeProps> = ({
  formData,
  trackMetadata,
  coverImage,
  onSave,
  onPublish,
}) => {
  const { selectedSong, setSelectedSong, setIsPlaying, isPlaying, togglePlayPause } =
    useCurrentPlayerStore()

  const getCoverImageUrl = () => {
    if (coverImage) {
      return URL.createObjectURL(coverImage)
    }
    return '/art/muza.png' // Fallback image
  }

  // Transform upload data into Album format
  const transformToAlbum = (): Album => {
    return {
      id: Date.now(),
      imageSrc: getCoverImageUrl(),
      title: formData.albumTitle || 'Untitled Album',
      releaseDate: new Date(formData.recordingDate),
      artist: formData.mainArtist || 'Unknown Artist',
      songs: trackMetadata.map((_, index) => index + 1),
    }
  }

  // Transform track metadata into SongDetails format
  const transformToSongDetails = (): SongDetails[] => {
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
        audioUrl: track.file ? URL.createObjectURL(track.file) : undefined,
      }
    })
  }

  const album = transformToAlbum()
  const songDetails = transformToSongDetails()

  return (
    <div className='w-full'>
      <div className='mx-auto py-6 px-[60px]'>
        <MediaHeader
          songs={songDetails}
          mediaType={MediaTypeEnum.Album}
          resourceId={album.id}
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

        <hr className='my-4 border-none border-t border-border-light' />

        <div className='flex-1 flex flex-col gap-0 gap-x-2 mt-4 mb-4'>
          {songDetails.map((song: SongDetails) => (
            <SongLine
              key={song.id}
              details={song}
              onClick={() => {
                if (selectedSong?.id === song.id) {
                  togglePlayPause()
                } else {
                  setSelectedSong(song)
                  setIsPlaying(true)
                }
              }}
              isPlaying={song.id === selectedSong?.id && !!isPlaying}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default UploadStepThree
