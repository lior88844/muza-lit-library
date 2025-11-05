import { searchAll } from '../../../server/api/search/search.service'
import { SearchQuerySchema } from '../../../server/schemas/common.schema'
import type { Route } from './+types/search'

export const loader = async ({ request }: Route.LoaderArgs) => {
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

  const results = await searchAll(parsed.data.query, parsed.data.limit, parsed.data.offset)

  return {
    ...results,
    query: parsed.data.query,
  }
}
