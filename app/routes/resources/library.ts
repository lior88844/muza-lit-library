import { EntityTypeEnum } from 'server/db/stack.entity'

import {
  addToLibrary,
  isInLibrary,
  removeFromLibrary,
} from '../../../server/api/user-library/user-library.service'
import { type UserLibrary } from '../../../server/db/user-library.entity'
import { userContext } from '../../store/router-context'
import type { Route } from './+types/library'

export const action = async ({ request, context }: Route.ActionArgs) => {
  const formData = await request.formData()
  const user = context.get(userContext)
  const entityType = formData.get('entityType') as EntityTypeEnum
  const entityId = formData.get('entityId') as string

  if (!user) {
    return {
      success: false,
      error: 'Unauthorized',
    }
  }
  // Validate required fields
  if (!entityType || !entityId) {
    return {
      success: false,
      error: 'Missing required fields: entityType, entityId, or actionType',
    }
  }
  // Validate resource type
  if (!Object.values(EntityTypeEnum).includes(entityType as EntityTypeEnum)) {
    return {
      success: false,
      error: 'Invalid resource type',
    }
  }

  try {
    const isExisting = await isInLibrary(user.id, entityType, parseInt(entityId))
    let data: UserLibrary | boolean = false
    if (!isExisting) {
      data = await addToLibrary(user.id, entityType, parseInt(entityId))
    } else {
      data = await removeFromLibrary(user.id, entityType, parseInt(entityId))
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
