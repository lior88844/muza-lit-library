/**
 * Track Play Recording API
 * Handles recording play history and incrementing play counts with idempotency
 */

import { desc, eq, sql } from 'drizzle-orm'

import { db } from '../../db/connection'
import { playHistory } from '../../db/play-history.entity'
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
 * Record a play event
 * Records play history (if user authenticated) and increments global play count
 *
 * @param userId - Cognito sub UUID or user ID string, null for anonymous plays
 * @param trackId - ID of the track
 * @param timestamp - When the play started (for idempotency)
 * @param duration - Seconds played (optional)
 * @param completed - Whether track finished (optional)
 * @returns Success status
 */
export async function recordPlay(
  userId: string | null,
  trackId: number,
  timestamp: number,
  duration?: number,
  completed?: boolean
): Promise<{ success: boolean; message?: string; playHistoryId?: number }> {
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

    // Record play history if user is authenticated
    let playHistoryId: number | undefined
    if (userId) {
      try {
        const [inserted] = await db
          .insert(playHistory)
          .values({
            userId,
            trackId,
            playedAt: new Date(timestamp),
            duration: duration ?? null,
            completed: completed ?? false,
          })
          .returning({ id: playHistory.id })

        playHistoryId = inserted?.id
      } catch (error) {
        // Log error but don't fail the entire operation
        console.error('Error recording play history:', error)
      }
    }

    // Increment global play count
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
      message: 'Play recorded',
      playHistoryId,
    }
  } catch (error) {
    console.error('Error recording play:', error)
    return {
      success: false,
      message: 'Failed to record play',
    }
  }
}

/**
 * Get user's play history
 *
 * @param userId - Cognito sub UUID or user ID string
 * @param limit - Maximum number of records to return
 * @param offset - Number of records to skip
 * @returns Array of play history records
 */
export async function getUserPlayHistory(userId: string, limit: number = 50, offset: number = 0) {
  try {
    const history = await db
      .select()
      .from(playHistory)
      .where(eq(playHistory.userId, userId))
      .orderBy(desc(playHistory.playedAt))
      .limit(limit)
      .offset(offset)

    return history
  } catch (error) {
    console.error('Error fetching user play history:', error)
    throw error
  }
}

/**
 * Get play history for a specific track
 *
 * @param trackId - ID of the track
 * @param limit - Maximum number of records to return
 * @returns Array of play history records
 */
export async function getTrackPlayHistory(trackId: number, limit: number = 50) {
  try {
    const history = await db
      .select()
      .from(playHistory)
      .where(eq(playHistory.trackId, trackId))
      .orderBy(desc(playHistory.playedAt))
      .limit(limit)

    return history
  } catch (error) {
    console.error('Error fetching track play history:', error)
    throw error
  }
}

/**
 * HTTP handler for recording a play
 * POST /api/track/record-play
 *
 * Body: {
 *   trackId: number,
 *   timestamp: number,
 *   duration?: number,
 *   completed?: boolean
 * }
 */
export async function handleRecordPlay(request: Request, userId: string | null): Promise<Response> {
  try {
    const body = await request.json()
    const { trackId, timestamp, duration, completed } = body

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

    // Record play
    const result = await recordPlay(userId, trackId, timestamp, duration, completed)

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 500,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error handling record play request:', error)
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
