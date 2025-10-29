import '../styles/scrollbar.scss'
import '../styles/variables.scss'
import '../styles/main.scss'

import { isRouteErrorResponse, useRouteError } from 'react-router'
import { useLoaderData } from 'react-router'
import { fetchArtistById } from 'server/data'

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

  return <>{artist.name}</>
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
        <h2>{error.status}</h2>
        <p>{message}</p>
      </div>
    )
  }

  return (
    <div>
      <h2>Something went wrong</h2>
      <p>Try again later.</p>
    </div>
  )
}
