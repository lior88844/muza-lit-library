import {
  createPlaylist,
  deletePlaylist,
  getUserPlaylists,
  syncPlaylistTracks,
  type TrackUpdateData,
  updatePlaylist,
} from '../../../server/api/playlist/playlist.service'
import type { PlaylistVisibilityEnum } from '../../../server/db/playlist.entity'
import { userContext } from '../../store/router-context'
import type { Route } from './+types/playlist'

export const action = async ({ request, context }: Route.ActionArgs) => {
  const user = context.get(userContext)
  if (!user?.id) {
    return {
      success: false,
      error: 'Unauthorized',
    }
  }

  const formData = await request.formData()
  const intent = formData.get('intent')

  if (intent === 'createPlaylist') {
    const name = formData.get('name') as string
    const visibility = formData.get('visibility') as PlaylistVisibilityEnum
    const description = formData.get('description') as string | undefined
    if (!name || !visibility) {
      return {
        success: false,
        error: 'Name and visibility are required',
      }
    }
    try {
      const playlist = await createPlaylist(user.id, {
        name,
        visibility: visibility,
        description: description || null,
      })

      return { success: true, playlist }
    } catch (error) {
      console.error('Create playlist error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create playlist',
      }
    }
  }

  if (intent === 'updatePlaylist') {
    const playlistId = parseInt(formData.get('playlistId') as string, 10)
    const name = formData.get('name') as string | undefined
    const visibility = formData.get('visibility') as string | undefined
    const description = formData.get('description') as string | undefined
    const songs = formData.get('songs') as string | undefined
    const trackUpdates = songs ? (JSON.parse(songs) as TrackUpdateData[]) : undefined
    try {
      const updateData: Record<string, unknown> = {}
      if (name) updateData.name = name
      if (visibility) updateData.visibility = visibility
      if (description !== undefined) updateData.description = description
      if (songs) updateData.trackIds = songs
      if (Object.keys(updateData).length > 0) {
        await updatePlaylist(playlistId, user.id, updateData)
      }
      console.log({ trackUpdates })

      if (trackUpdates) {
        await syncPlaylistTracks(playlistId, trackUpdates, user.id)
      }
      const playlist = await updatePlaylist(playlistId, user.id, updateData)

      return { success: true, playlist }
    } catch (error) {
      console.error('Update playlist error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update playlist',
      }
    }
  }

  if (intent === 'deletePlaylist') {
    const playlistId = parseInt(formData.get('playlistId') as string, 10)

    if (!playlistId) {
      return {
        success: false,
        error: 'Playlist ID is required',
      }
    }

    try {
      const deleted = await deletePlaylist(playlistId, user.id)
      if (deleted) {
        return { success: true }
      } else {
        return {
          success: false,
          error: 'Playlist not found or unauthorized',
        }
      }
    } catch (error) {
      console.error('Delete playlist error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete playlist',
      }
    }
  }

  return {
    success: false,
    error: 'Invalid intent',
  }
}

export const loader = async ({ context }: Route.LoaderArgs) => {
  const user = context.get(userContext)
  if (!user?.id) {
    return {
      success: false,
      error: 'Unauthorized',
    }
  }

  try {
    const playlists = await getUserPlaylists(user.id)
    return {
      success: true,
      playlists,
    }
  } catch (error) {
    console.error('Get playlists error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch playlists',
    }
  }
}
