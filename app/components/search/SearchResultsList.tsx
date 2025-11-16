import { useTranslation } from 'react-i18next'
import type { AlbumResponse } from 'server/api/album/types/AlbumResponse'
import type { ArtistMiniResponse } from 'server/api/artist/types/ArtistResponse'
import type { PlaylistResponse } from 'server/api/playlist/types/MiniPlaylistResponse'
import type { TrackResponse } from 'server/api/track/types/TrackResponse'

import AlbumPreview from '~/components/albumDisplays/AlbumPreview'
import PlaylistCover from '~/components/albumDisplays/PlaylistCover'
import { ArtistPreview } from '~/components/artistDisplays/ArtistPreview'
import TrackPreview from '~/components/songLineDisplays/TrackPreview'
import { Divider } from '~/components/ui/divider'
import { Typography } from '~/components/ui/typography'
import { useDrawerStore } from '~/store/drawerStore'
import type { MusicPlaylist } from '~/store/models'
import { usePlayerStore } from '~/store/playerStore'

export interface SearchResultsListProps {
  albums: AlbumResponse[]
  artists: ArtistMiniResponse[]
  tracks: TrackResponse[]
  playlists: PlaylistResponse[]
  showHeaders?: boolean
  className?: string
  draggable?: boolean
}

export function SearchResultsList({
  albums,
  artists,
  tracks,
  playlists,
  showHeaders = true,
  className = '',
  draggable = false,
}: SearchResultsListProps) {
  const { t } = useTranslation()
  const { isPlaylistDrawerOpen, isStackDrawerOpen } = useDrawerStore()
  const { currentTrack, playPause, playQueue } = usePlayerStore()
  const hasResults =
    albums.length > 0 || artists.length > 0 || tracks.length > 0 || playlists.length > 0

  if (!hasResults) {
    return null
  }
  const onTogglePlay = (track: TrackResponse) => {
    if (currentTrack?.id === track.id) {
      playPause()
    } else {
      playQueue({ items: [track], startIndex: 0 })
    }
  }
  const isDraggable = isPlaylistDrawerOpen || isStackDrawerOpen || draggable
  return (
    <div className={`flex flex-col space-y-12 ${className}`}>
      {albums.length > 0 && (
        <div className='w-full'>
          {showHeaders && (
            <Typography variant='h2' className='mb-6'>
              {t('search.albums')} ({albums.length})
            </Typography>
          )}
          <div className='grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4 max-md:grid-cols-[repeat(auto-fill,minmax(140px,1fr))] max-md:gap-3'>
            {albums.map(album => (
              <AlbumPreview key={album.id} details={album} draggable={isDraggable} />
            ))}
          </div>
          {showHeaders && <Divider className='mt-8' />}
        </div>
      )}

      {artists.length > 0 && (
        <div className='w-full'>
          {showHeaders && (
            <Typography variant='h2' className='mb-6'>
              {t('search.artists')} ({artists.length})
            </Typography>
          )}
          <div className='grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4 max-md:grid-cols-[repeat(auto-fill,minmax(140px,1fr))] max-md:gap-3'>
            {artists.map(artist => (
              <ArtistPreview
                key={artist.id}
                details={{
                  id: artist.id,
                  imageUrl: artist.imageUrl || null,
                  name: artist.name,
                  albumsCount: artist.albumsCount || 0,
                }}
                draggable={isStackDrawerOpen}
              />
            ))}
          </div>
          {showHeaders && <Divider className='mt-8' />}
        </div>
      )}

      {tracks.length > 0 && (
        <div className='w-full'>
          {showHeaders && (
            <Typography variant='h2' className='mb-6'>
              {t('search.tracks')} ({tracks.length})
            </Typography>
          )}
          <div className='flex flex-col gap-1'>
            {tracks.map(track => (
              <TrackPreview
                key={track.id}
                track={track}
                onClick={onTogglePlay}
                draggable={isDraggable}
              />
            ))}
          </div>
          {showHeaders && <Divider className='mt-8' />}
        </div>
      )}

      {playlists.length > 0 && (
        <div className='w-full'>
          {showHeaders && (
            <Typography variant='h2' className='mb-6'>
              {t('search.playlists')} ({playlists.length})
            </Typography>
          )}
          <div className='grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4 max-md:grid-cols-[repeat(auto-fill,minmax(140px,1fr))] max-md:gap-3'>
            {playlists.map(playlist => (
              <PlaylistCover
                draggable={isStackDrawerOpen}
                key={playlist.id}
                playlist={playlist as MusicPlaylist}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
