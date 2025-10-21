import '../components/sections/MusicSidebar'
import '../styles/scrollbar.scss'
import '../styles/variables.scss'
import '../styles/main.scss'

import { useNavigate } from 'react-router'

import AlbumPreview from '~/components/albumDisplays/AlbumPreview'
import { useTranslation } from '~/lib/i18n/translations'
import { useMedia } from '~/store/media/mediaContext'
import type { Album } from '~/store/models'

export default function Albums() {
  const { t } = useTranslation()
  const library = useMedia()
  const { newReleases, featured, recommended } = library.albums

  const navigate = useNavigate()

  const onAlbumClick = (album: Album) => {
    navigate(`/albums/${album.id}`)
  }

  return (
    <main>
      <h1>{t('page.albums')}</h1>

      <hr />
      <h2>{t('section.featuredAlbums')}</h2>
      <div className='album-list'>
        {featured.map((a: Album) => (
          <AlbumPreview key={a.id} details={a} onAlbumClick={() => onAlbumClick(a)} />
        ))}
      </div>

      <hr />
      <h2>{t('section.newReleases')}</h2>
      <div className='album-list'>
        {newReleases.map((a: Album) => (
          <AlbumPreview key={a.id} details={a} onAlbumClick={() => onAlbumClick(a)} />
        ))}
      </div>

      <hr />
      <h2>{t('section.recommendedAlbums')}</h2>
      <div className='album-list'>
        {recommended.map((a: Album) => (
          <AlbumPreview key={a.id} details={a} onAlbumClick={() => onAlbumClick(a)} />
        ))}
      </div>
    </main>
  )
}
