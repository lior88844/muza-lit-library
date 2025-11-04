import { useNavigate } from 'react-router'

import MusicListSectionComponent from '~/components/listsDisplays/MusicListSection'
import { Divider } from '~/components/ui/divider'
import { Typography } from '~/components/ui/typography'
import { useTranslation } from '~/lib/i18n/translations'
import { useMedia } from '~/store/media/mediaContext'
import type { Album } from '~/store/models'

export default function Explore() {
  const { t } = useTranslation()
  const library = useMedia()
  const { newReleases, featured, recommended } = library.albums
  const navigate = useNavigate()

  const onAlbumClick = (album: Album) => {
    navigate(`/albums/${album.id}`)
  }

  const handleShowAll = (sectionTitle: string) => {
    navigate('/albums')
  }

  // Define sections configuration for the loop
  const sections = [
    {
      title: t('section.newReleases'),
      albums: newReleases,
    },
    {
      title: t('section.theClassics'),
      albums: featured,
    },
    {
      title: t('section.uncoveredGems'),
      albums: recommended,
    },
    {
      title: t('nav.albums'),
      albums: featured.concat(recommended),
    },
    {
      title: t('section.theOnesYouMissed'),
      albums: recommended,
    },
  ]

  return (
    <>
      <Typography variant='h1' as='h2' className='px-3 pb-4'>
        {t('page.explore')}
      </Typography>
      <Divider />

      {sections.map(section => (
        <div key={section.title}>
          <MusicListSectionComponent
            title={section.title}
            type='album'
            list={section.albums}
            onShowAll={handleShowAll}
            onAlbumClick={onAlbumClick}
            albums={section.albums}
          />
          <Divider />
        </div>
      ))}
    </>
  )
}
