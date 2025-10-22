import {
  addToLibrary,
  getUserLibrary,
  isInLibrary,
  removeFromLibrary,
} from '../../../server/api/user-library/user-library.service'
import { MediaTypeEnum, type UserLibrary } from '../../../server/db/user-library.entity'
import { userContext } from '../../store/router-context'
import type { Route } from './+types/library'

export const action = async ({ request, context }: Route.ActionArgs) => {
  const formData = await request.formData()
  const user = context.get(userContext)
  const resourceType = formData.get('resourceType') as string
  const resourceId = formData.get('resourceId') as string

  if (!user) {
    return {
      success: false,
      error: 'Unauthorized',
    }
  }
  // Validate required fields
  if (!resourceType || !resourceId) {
    return {
      success: false,
      error: 'Missing required fields: resourceType, resourceId, or actionType',
    }
  }
  // Validate resource type
  if (!Object.values(MediaTypeEnum).includes(resourceType as MediaTypeEnum)) {
    return {
      success: false,
      error: 'Invalid resource type',
    }
  }

  try {
    const isExisting = await isInLibrary(
      user.id,
      resourceType as MediaTypeEnum,
      parseInt(resourceId)
    )
    let data: UserLibrary | boolean = false
    if (!isExisting) {
      data = await addToLibrary(user.id, resourceType as MediaTypeEnum, parseInt(resourceId))
    } else {
      data = await removeFromLibrary(user.id, resourceType as MediaTypeEnum, parseInt(resourceId))
    }

    const response = {
      success: true,
      message: 'Library action completed',
      data,
    }
    return response
  } catch (error) {
    console.error('Library action error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

export const loader = async ({ request, context }: Route.LoaderArgs) => {
  const user = context.get(userContext)
  if (!user) {
    return {
      success: false,
      error: 'Unauthorized',
    }
  }
  const library = await getUserLibrary(user.id)
  return {
    success: true,
    library,
  }
}
