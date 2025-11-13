import { createContext, useContext } from 'react'
import type { TrackResponse } from 'server/api/track/types/TrackResponse'

import type { UserLibrary } from '../../../server/db/user-library.entity'
import type { MusicPlaylist, Section } from '../models'

export type MediaData = {
  library: UserLibrary[]
  playlists: MusicPlaylist[]
  songs: TrackResponse[]
  sidebar: {
    sections: Section[]
  }
}

export const MediaContext = createContext<MediaData | null>(null)

export function useMedia() {
  const media = useContext(MediaContext)
  if (!media) {
    throw new Error('useMedia must be used within mediaContext.Provider')
  }

  return media
}
