import type { EntityTypeEnum, Stack } from 'server/db/stack.entity'
import { StackEntityTypeEnum, type StackItem } from 'server/db/stack-item.entity'

import type { MiniAlbum } from '../album/types/MiniAlbumResponse'
import type { ArtistMiniResponse } from '../artist/types/ArtistResponse'
import type { MiniPlaylistResponse } from '../playlist/types/MiniPlaylistResponse'
import type { TrackResponse } from '../track/types/TrackResponse'

export type Entity = MiniAlbum | ArtistMiniResponse | TrackResponse | MiniPlaylistResponse

export interface StackWithEntities<T extends Entity = Entity> extends Stack {
  items: StackItemWithEntity<T>[]
}

export interface StackItemWithEntity<T extends Entity = Entity> extends StackItem {
  entity: T
}

export interface StackWithItems extends Stack {
  items: StackItem[]
}

export interface StackItemUpdateData {
  entityType: EntityTypeEnum
  entityId: number
  displayOrder: number
}

// TS Guards for StackWithEntities
export function isStackWithTracks(
  stack: StackWithEntities
): stack is StackWithEntities<TrackResponse> {
  return stack.entityType === StackEntityTypeEnum.Track
}
