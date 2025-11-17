/**
 * Track Play Count API
 * Handles incrementing play counts with idempotency to prevent double-counting
 */

import { eq, sql } from 'drizzle-orm'

import { db } from '../../db/connection'
import { tracks } from '../../db/track.entity'

/**
 * Simple in-memory cache for play count idempotency
 * In production, this should use Redis or similar persistent cache
 *
 * Key format: `${trackId}-${timestamp}`
 * Expires after 1 hour automatically
 */
const playCountCache = new Map<string, number>()

// Clean up cache every 10 minutes
setInterval(
  () => {
    const now = Date.now()
    const oneHourAgo = now - 60 * 60 * 1000

    for (const [key, timestamp] of playCountCache.entries()) {
      if (timestamp < oneHourAgo) {
        playCountCache.delete(key)
      }
    }
  },
  10 * 60 * 1000
) // 10 minutes

/**
 * Increment play count for a track
 * Uses idempotency key to prevent duplicate counts
 *
 * @param trackId - ID of the track
 * @param timestamp - When the play started (for idempotency)
 * @returns Success status
 */
export async function incrementPlayCount(
  trackId: number,
  timestamp: number
): Promise<{ success: boolean; message?: string }> {
  try {
    // Create idempotency key
    const idempotencyKey = `${trackId}-${timestamp}`

    // Check if already processed
    if (playCountCache.has(idempotencyKey)) {
      return {
        success: true,
        message: 'Play count already recorded',
      }
    }

    // Increment in database
    await db
      .update(tracks)
      .set({
        playCount: sql`${tracks.playCount} + 1`,
        lastPlayed: new Date(),
      })
      .where(eq(tracks.id, trackId))

    // Mark as processed
    playCountCache.set(idempotencyKey, Date.now())

    return {
      success: true,
      message: 'Play count incremented',
    }
  } catch (error) {
    console.error('Error incrementing play count:', error)
    return {
      success: false,
      message: 'Failed to increment play count',
    }
  }
}

/**
 * HTTP handler for incrementing play count
 * POST /api/track/increment-play-count
 *
 * Body: { trackId: number, timestamp: number }
 */
export async function handleIncrementPlayCount(request: Request): Promise<Response> {
  try {
    const body = await request.json()
    const { trackId, timestamp } = body

    // Validate input
    if (typeof trackId !== 'number' || typeof timestamp !== 'number') {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Invalid input: trackId and timestamp must be numbers',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Increment play count
    const result = await incrementPlayCount(trackId, timestamp)

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 500,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error handling play count request:', error)
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Internal server error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
