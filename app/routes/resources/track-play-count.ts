/**
 * Track Play Count Resource Route
 * POST /api/track/increment-play-count
 */

import { handleIncrementPlayCount } from '../../../server/api/track/increment-play-count'

export async function action({ request }: { request: Request }) {
  return handleIncrementPlayCount(request)
}

