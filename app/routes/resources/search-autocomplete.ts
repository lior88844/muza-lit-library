import { searchAutocomplete } from '../../../server/api/search/search.service'
import type { Route } from './+types/search-autocomplete'

export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url)
  const query = url.searchParams.get('q') || ''

  if (!query || query.trim().length === 0) {
    return new Response(
      JSON.stringify({
        results: [],
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  try {
    const results = await searchAutocomplete(query.trim(), 15)
    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Autocomplete search error:', error)
    return new Response(
      JSON.stringify({
        results: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
