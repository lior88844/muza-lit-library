import { useTranslation } from 'react-i18next'
import { useLoaderData } from 'react-router'
import { getUserLibrary } from 'server/api/user-library/user-library.service'
import { EntityTypeEnum } from 'server/db/stack.entity'

import AlbumPreview from '~/components/albumDisplays/AlbumPreview'
import { Typography } from '~/components/ui/typography'
import { useCurrentPlayerStore } from '~/store/currentPlayerStore'
import { userContext } from '~/store/router-context'

import type { Route } from './+types/albums'
import styles from './albums.module.css'

export async function loader({ context }: Route.LoaderArgs) {
  const user = context.get(userContext)
  if (!user) {
    return {
      success: false,
      error: 'Unauthorized',
    }
  }
  const libraryAlbums = await getUserLibrary<EntityTypeEnum.Album>(user.id, EntityTypeEnum.Album)
  return {
    libraryAlbums,
  }
}
export default function Albums() {
  const { t } = useTranslation()
  const { isPlaylistDrawerOpen } = useCurrentPlayerStore()
  const { libraryAlbums } = useLoaderData<typeof loader>()

  return (
    <>
      <Typography variant={'h1'} as='h2' className={'px-3 pb-4'}>
        {t('page.albums')}
      </Typography>

      <div className={styles.albumList}>
        {libraryAlbums?.map(a => (
          <AlbumPreview key={a.id} details={a.entity} draggable={isPlaylistDrawerOpen} />
        ))}
      </div>
    </>
  )
}
