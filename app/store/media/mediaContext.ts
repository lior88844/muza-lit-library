import { createContext, useContext } from 'react'

import type { UserLibrary } from '../../../server/db/user-library.entity'
import type { Album, Artist, MusicPlaylist, Section, SongDetails } from '../models'
// Client-side context for library data - populated from root loader
export type MediaData = {
  albums: {
    featured: Album[]
    newReleases: Album[]
    recommended: Album[]
  }
  library: UserLibrary[]
  artists: Artist[]
  songs: SongDetails[]
  playlists: MusicPlaylist[]
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
