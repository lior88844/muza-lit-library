/**
 * Play History Resource Route
 * GET /api/play-history
 */

import { getUserPlayHistory } from '../../../server/api/track/record-play'
import { userContext } from '../../store/router-context'
import type { Route } from './+types/play-history'

export async function loader({ request, context }: Route.LoaderArgs) {
  const user = context.get(userContext)
  if (!user) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Unauthorized',
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  try {
    // Get query parameters
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '50', 10)
    const offset = parseInt(url.searchParams.get('offset') || '0', 10)

    // For now, use user ID as string. In future, extract Cognito sub from auth header
    const userId = String(user.id)
    const history = await getUserPlayHistory(userId, limit, offset)

    return new Response(
      JSON.stringify({
        success: true,
        history,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error fetching play history:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch play history',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
