import '../styles/scrollbar.scss'
import '../styles/variables.scss'
import '../styles/main.scss'

import { useMemo } from 'react'

import ArtistPreview from '~/components/artistDisplays/ArtistPreview'
import { useTranslation } from '~/lib/i18n/translations'
import { useMedia } from '~/store/media/mediaContext'

import { MediaTypeEnum } from '../../server/db/user-library.entity'

export default function Artists() {
  const { t } = useTranslation()
  const { library, artists } = useMedia()
  const libraryArtists = useMemo(() => {
    const artistIds = library
      .filter(item => item.resourceType === MediaTypeEnum.Artist)
      .map(i => i.resourceId)

    return artists.filter(artist => artistIds.includes(artist.id))
  }, [artists, library])
  return (
    <main>
      <h1>{t('page.artists')}</h1>
      <hr />
      <div className='artist-list'>
        {libraryArtists.map(artist => (
          <ArtistPreview key={artist.id} details={artist} />
        ))}
      </div>
    </main>
  )
}
