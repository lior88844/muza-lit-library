import '../styles/variables.css'

import { useMemo } from 'react'
import { useNavigate } from 'react-router'

import AlbumPreview from '~/components/albumDisplays/AlbumPreview'
import { Typography } from '~/components/ui/typography'
import { useTranslation } from '~/lib/i18n/translations'
import { useMedia } from '~/store/media/mediaContext'
import type { Album } from '~/store/models'

import { MediaTypeEnum } from '../../server/db/user-library.entity'
import styles from './albums.module.css'

export default function Albums() {
  const { t } = useTranslation()
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
    <>
      <Typography variant={'h1'} as='h2' className={'px-3 pb-4'}>
        {t('page.albums')}
      </Typography>
      <div className={styles.albumList}>
        {libraryAlbums.map(a => (
          <AlbumPreview key={a.id} details={a} onAlbumClick={() => onAlbumClick(a)} />
        ))}
      </div>
    </>
  )
}
