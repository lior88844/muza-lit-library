import { createContext, useContext } from 'react'

import type { UserLibrary } from '../../../server/db/user-library.entity'
import type { MusicPlaylist, Section, SongDetails } from '../models'

export type MediaData = {
  library: UserLibrary[]
  playlists: MusicPlaylist[]
  songs: SongDetails[]
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
