import '../components/sections/MusicSidebar'
import '../styles/variables.css'
import './home.css'

import { useNavigate } from 'react-router'

import MusicListSectionComponent from '~/components/listsDisplays/MusicListSection'
import { Divider } from '~/components/ui/divider'
import { Typography } from '~/components/ui/typography'
import { useTranslation } from '~/lib/i18n/translations'
import { useCurrentPlayerStore } from '~/store/currentPlayerStore'
import { useMedia } from '~/store/media/mediaContext'
import type { Album } from '~/store/models'

export default function Home() {
  const { t } = useTranslation()
  const { selectedSong, setSelectedSong } = useCurrentPlayerStore()

  // Get library data from context (fetched once on the server)
  const library = useMedia()
  const { songs, albums, artists } = library

  const navigate = useNavigate()

  const onAlbumClick = (album: Album) => {
    navigate(`/albums/${album.id}`)
  }

  const handleShowAll = (sectionTitle: string) => {
    switch (sectionTitle) {
      case t('section.newReleases'):
        navigate('/albums')
        break
      case t('section.recentlyPlayed'):
        navigate('/songs')
        break
      case t('section.artists'):
        navigate('/artists')
        break
      default:
        break
    }
  }

  const sections = [
    {
      title: t('section.newReleases'),
      type: 'album' as const,
      albums: albums.newReleases,
    },
    {
      title: t('section.recentlyPlayed'),
      type: 'song' as const,
      songs: songs.slice(0, 30),
    },
    {
      title: t('section.artists'),
      type: 'artist' as const,
      artists: artists.slice(0, 6),
    },
  ]

  return (
    <div className='home-page'>
      <div className='page-header'>
        <Typography variant='h1' as='h2' className='pb-4'>
          {t('page.home')}
        </Typography>
      </div>
      <div className='sections-container'>
        <Divider />
        {sections.map((section, index) => (
          <div key={section.title} className='section-wrapper'>
            {section.type === 'album' && (
              <MusicListSectionComponent
                title={section.title}
                type='album'
                list={section.albums}
                onShowAll={handleShowAll}
                onAlbumClick={onAlbumClick}
                albums={section.albums}
              />
            )}
            {section.type === 'artist' && (
              <MusicListSectionComponent
                title={section.title}
                type='artist'
                list={[]}
                onShowAll={handleShowAll}
                artists={section.artists}
              />
            )}
            {section.type === 'song' && (
              <MusicListSectionComponent
                title={section.title}
                type='song'
                list={[]}
                onShowAll={handleShowAll}
                songs={section.songs}
                onSongClick={setSelectedSong}
                selectedSong={selectedSong || undefined}
              />
            )}
            {index < sections.length - 1 && <Divider />}
          </div>
        ))}
      </div>
    </div>
  )
}
