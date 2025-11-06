import '../styles/variables.css'

import { useTranslation } from 'react-i18next'
import { useLoaderData } from 'react-router'
import { getUserLibrary } from 'server/api/user-library/user-library.service'
import { EntityTypeEnum } from 'server/db/stack.entity'

import ArtistPreview from '~/components/artistDisplays/ArtistPreview'
import { Divider } from '~/components/ui/divider'
import { Typography } from '~/components/ui/typography'
import { userContext } from '~/store/router-context'

import type { Route } from './+types/artists'

export async function loader({ context }: Route.LoaderArgs) {
  const user = context.get(userContext)
  if (!user) {
    return {
      success: false,
      error: 'Unauthorized',
    }
  }
  const libraryArtists = await getUserLibrary<EntityTypeEnum.Artist>(user.id, EntityTypeEnum.Artist)
  return {
    libraryArtists,
  }
}
export default function Artists() {
  const { t } = useTranslation()
  const { libraryArtists } = useLoaderData<typeof loader>()
  return (
    <>
      <Typography variant='h1' as='h2' className='pb-4'>
        {t('page.artists')}
      </Typography>
      <Divider />

      <div className='artist-list'>
        {libraryArtists?.map(artist => (
          <ArtistPreview key={artist.id} details={artist.entity} />
        ))}
      </div>
    </>
  )
}
