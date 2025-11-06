import '../../styles/variables.css'
import './artist-page.css'

import { isRouteErrorResponse, useRouteError } from 'react-router'
import { useLoaderData } from 'react-router'
import { fetchArtistById } from 'server/root.service'

import { Typography } from '~/components/ui/typography'

import { ArtistDetails } from './components/artist-details'

export async function loader({ params }: { params: { id: string } }) {
  const artistId = +params.id

  if (isNaN(artistId)) {
    throw new Response('Invalid artist ID', { status: 400 })
  }

  const artistData = await fetchArtistById(artistId)

  if (!artistData) {
    throw new Response('Artist not found', { status: 404 })
  }

  return { artist: artistData }
}

export default function ArtistPage() {
  const { artist } = useLoaderData<typeof loader>()

  return (
    <div className='artist-page'>
      <ArtistDetails artist={artist} />
    </div>
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
