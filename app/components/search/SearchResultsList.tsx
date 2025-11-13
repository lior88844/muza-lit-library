import { useTranslation } from 'react-i18next'
import type { MiniAlbum } from 'server/api/album/types/MiniAlbumResponse'
import type { ArtistMiniResponse } from 'server/api/artist/types/ArtistResponse'
import type { MiniPlaylistResponse } from 'server/api/playlist/types/MiniPlaylistResponse'

import AlbumPreview from '~/components/albumDisplays/AlbumPreview'
import PlaylistCover from '~/components/albumDisplays/PlaylistCover'
import { ArtistPreview } from '~/components/artistDisplays/ArtistPreview'
import SongLineWithCover from '~/components/songLineDisplays/SongLineWithCover'
import { Divider } from '~/components/ui/divider'
import { Typography } from '~/components/ui/typography'
import { generatePlaylistCoverImages } from '~/lib/utils'
import { useDrawerStore } from '~/store/drawerStore'
import type { MusicPlaylist, SongDetails } from '~/store/models'
import { usePlayerStore } from '~/store/playerStore'

export interface SearchResultsListProps {
  albums: MiniAlbum[]
  artists: ArtistMiniResponse[]
  tracks: SongDetails[]
  playlists: MiniPlaylistResponse[]
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
  const {
    selectedSong: globalSelectedSong,
    setSelectedSong,
    setIsPlaying,
    isPlaying,
    togglePlayPause,
  } = usePlayerStore()
  const { isPlaylistDrawerOpen, isStackDrawerOpen } = useDrawerStore()

  const hasResults =
    albums.length > 0 || artists.length > 0 || tracks.length > 0 || playlists.length > 0

  if (!hasResults) {
    return null
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
              <SongLineWithCover
                key={track.id}
                details={track}
                onClick={() => {
                  if (globalSelectedSong?.id === track.id) {
                    togglePlayPause()
                  } else {
                    setSelectedSong(track)
                    setIsPlaying(true)
                  }
                }}
                isPlaying={track.id === globalSelectedSong?.id && !!isPlaying}
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
                key={playlist.id}
                albumImages={generatePlaylistCoverImages(playlist as MusicPlaylist)}
                title={playlist.title}
                songsCount={playlist.trackCount.toString()}
                userName={playlist.author || t('common.unknown')}
                playlist={playlist as MusicPlaylist}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
