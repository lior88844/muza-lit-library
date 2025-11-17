import { useTranslation } from 'react-i18next'
import { isRouteErrorResponse, useLoaderData, useRouteError } from 'react-router'
import type { AlbumResponse } from 'server/api/album/types/AlbumResponse'
import { formatArtistAlbum } from 'server/api/artist/artist.service'
import type { StackItemWithEntity } from 'server/api/stack/types'
import { EntityTypeEnum, StackPageIdEnum, StackSelectionTypeEnum } from 'server/db/stack.entity'
import { fetchArtistById } from 'server/root.service'

import { StackPreview } from '~/components/listsDisplays/StackPreview'
import { Typography } from '~/components/ui/typography'

import { ArtistDetails } from './components/artist-details'

export async function loader({ params }: { params: { id: string } }) {
  const artistId = +params.id

  if (Number.isNaN(artistId)) {
    throw new Response('Invalid artist ID', { status: 400 })
  }

  const artist = await fetchArtistById(artistId)

  if (!artist) {
    throw new Response('Artist not found', { status: 404 })
  }

  const stackItems: StackItemWithEntity<AlbumResponse>[] = artist.albumArtists.map(
    (albumArtist, index) => ({
      id: index + 1,
      stackId: 1,
      entityType: EntityTypeEnum.Album,
      entityId: albumArtist.album.id,
      displayOrder: index,
      entity: formatArtistAlbum(albumArtist),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  )

  return { artist, stackItems }
}

export default function ArtistPage() {
  const { artist, stackItems } = useLoaderData<typeof loader>()
  const { t } = useTranslation()

  return (
    <>
      <ArtistDetails artist={artist} />

      <section className='mt-44'>
        <StackPreview
          stack={{
            id: 1,
            title: t('common.albums'),
            pageId: StackPageIdEnum.Artist,
            entityType: EntityTypeEnum.Album,
            items: stackItems,
            description: null,
            displayOrder: 1,
            selectionType: StackSelectionTypeEnum.Manual,
            filterConfig: null,
            isActive: null,
            createdAt: null,
            updatedAt: null,
          }}
        />
      </section>
    </>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()

  if (isRouteErrorResponse(error)) {
    const message =
      typeof error.data === 'string'
        ? error.data
        : (error.data?.message ?? error.statusText ?? 'Error')
    return (
      <div>
        <Typography variant='h2' className='mb-3'>
          {error.status}
        </Typography>
        <Typography>{message}</Typography>
      </div>
    )
  }

  return (
    <div>
      <Typography variant='h2' className='mb-3'>
        Something went wrong
      </Typography>
      <Typography>Try again later.</Typography>
    </div>
  )
}
