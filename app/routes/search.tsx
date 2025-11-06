import '../styles/variables.css'

import { useTranslation } from 'react-i18next'
import { useLoaderData, useSearchParams } from 'react-router'

import { SearchResultsList } from '~/components/search/SearchResultsList'
import { Typography } from '~/components/ui/typography'

import { searchAll } from '../../server/api/search/search.service'
import { SearchQuerySchema } from '../../server/schemas/common.schema'
import type { Route } from './+types/search'

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url)
  const query = url.searchParams.get('q') || ''
  const limitParam = url.searchParams.get('limit')
  const offsetParam = url.searchParams.get('offset')

  if (!query || query.trim().length === 0) {
    return {
      albums: [],
      artists: [],
      tracks: [],
      total: 0,
      query: '',
    }
  }

  const parsed = SearchQuerySchema.safeParse({
    query: query.trim(),
    limit: limitParam ? parseInt(limitParam, 10) : 20,
    offset: offsetParam ? parseInt(offsetParam, 10) : 0,
  })

  if (!parsed.success) {
    return {
      albums: [],
      artists: [],
      tracks: [],
      total: 0,
      query: query.trim(),
    }
  }

  try {
    const results = await searchAll(parsed.data.query, parsed.data.limit, parsed.data.offset)
    return {
      ...results,
      query: parsed.data.query,
    }
  } catch (error) {
    console.error('Search error:', error)
    return {
      albums: [],
      artists: [],
      tracks: [],
      total: 0,
      query: query.trim(),
    }
  }
}

export function ErrorBoundary() {
  return (
    <div className='flex min-h-[400px] flex-col items-center justify-center p-8'>
      <Typography variant='h2' className='mb-4'>
        Error loading search results
      </Typography>
      <Typography className='text-muted-foreground'>Please try again later.</Typography>
    </div>
  )
}

export default function Search() {
  const { t } = useTranslation()
  const data = useLoaderData<typeof loader>()
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || data.query || ''

  const hasResults = data.albums.length > 0 || data.artists.length > 0 || data.tracks.length > 0

  return (
    <div className='mx-auto max-w-[1400px] px-6 py-8'>
      <div className='mb-8'>
        <Typography variant='h1' as='h2' className='mb-2'>
          {t('page.search')}
        </Typography>
        {query && (
          <Typography className='text-muted-foreground'>
            {t('search.resultsFor', { query })}
          </Typography>
        )}
      </div>

      {!query ? (
        <div className='flex min-h-[400px] flex-col items-center justify-center'>
          <Typography variant='h3' className='text-muted-foreground mb-4'>
            {t('search.enterQuery')}
          </Typography>
        </div>
      ) : !hasResults ? (
        <div className='flex min-h-[400px] flex-col items-center justify-center'>
          <Typography variant='h3' className='mb-4'>
            {t('search.noResults')}
          </Typography>
          <Typography className='text-muted-foreground'>{t('search.tryDifferentQuery')}</Typography>
        </div>
      ) : (
        <SearchResultsList albums={data.albums} artists={data.artists} tracks={data.tracks} />
      )}
    </div>
  )
}
