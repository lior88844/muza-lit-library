/**
 * Track Play Recording Resource Route
 * POST /api/track/record-play
 */

import { handleRecordPlay } from '../../../server/api/track/record-play'
import { userContext } from '../../store/router-context'
import type { Route } from './+types/track-record-play'

export async function action({ request, context }: Route.ActionArgs) {
  // Get user from context (may be null for anonymous users)
  const user = context.get(userContext)
  // For now, use user ID as string. In future, extract Cognito sub from auth header
  const userId = user ? String(user.id) : null

  return handleRecordPlay(request, userId)
}
