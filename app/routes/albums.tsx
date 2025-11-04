import '../components/sections/MusicSidebar'
import '../styles/scrollbar.scss'
import '../styles/variables.scss'
import '../styles/main.scss'

import { useMemo } from 'react'
import { useNavigate } from 'react-router'

import AlbumPreview from '~/components/albumDisplays/AlbumPreview'
import { useTranslation } from '~/lib/i18n/translations'
import { useCurrentPlayerStore } from '~/store/currentPlayerStore'
import { useMedia } from '~/store/media/mediaContext'
import type { Album } from '~/store/models'

import { MediaTypeEnum } from '../../server/db/user-library.entity'

export default function Albums() {
  const { t } = useTranslation()
  const { isPlaylistDrawerOpen } = useCurrentPlayerStore()
  const { library, albums } = useMedia()
  const libraryAlbums = useMemo(() => {
    const albumIds = library
      .filter(item => item.resourceType === MediaTypeEnum.Album)
      .map(i => i.resourceId)

    return albums.newReleases.filter(album => albumIds.includes(album.id))
  }, [albums, library])

  const navigate = useNavigate()

  const onAlbumClick = (album: Album) => {
    navigate(`/albums/${album.id}`)
  }

  return (
    <main>
      <h1>{t('page.albums')}</h1>
      <div className='album-list'>
        {libraryAlbums.map(a => (
          <AlbumPreview
            key={a.id}
            details={a}
            onAlbumClick={() => onAlbumClick(a)}
            draggable={isPlaylistDrawerOpen}
          />
        ))}
      </div>
    </main>
  )
}
