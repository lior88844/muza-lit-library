import '../styles/variables.css'

import { useMemo } from 'react'

import ArtistPreview from '~/components/artistDisplays/ArtistPreview'
import { Divider } from '~/components/ui/divider'
import { Typography } from '~/components/ui/typography'
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
    <>
      <Typography variant='h1' as='h2' className='pb-4'>
        {t('page.artists')}
      </Typography>
      <Divider />

      <div className='artist-list'>
        {libraryArtists.map(artist => (
          <ArtistPreview key={artist.id} details={artist} />
        ))}
      </div>
    </>
  )
}
