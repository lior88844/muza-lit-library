/**
 * Music Player Type Definitions
 * Defines the core types for queue management, playback state, and player controls
 */

export type PlaySourceType = 'album' | 'playlist' | 'songs' | 'artist' | 'stack' | 'custom'

export type RepeatMode = 'off' | 'one' | 'all'

/**
 * Item in the playback queue
 * Represents a single track with all necessary metadata for playback
 */
export interface QueueItem {
  id: number
  audioUrl: string
  title: string
  artist?: string
  album?: string
  albumId?: number
  imageSrc?: string
  duration?: number | null // in seconds
  year?: number
  artistId?: number
  plays?: number
}

/**
 * Metadata about the source of the current queue
 * Tracks what album/playlist/context the user is playing from
 */
export interface PlaySourceMeta {
  type: PlaySourceType
  id?: number // albumId, playlistId, etc.
  title?: string // "Dark Side of the Moon", "My Playlist", etc.
}

/**
 * Play attempt tracking for accurate play count analytics
 * Ensures we only count plays after 30s and avoid duplicates
 */
export interface PlayAttempt {
  startedAt: number // timestamp when playback started
  reported: boolean // whether this play has been reported to backend
}

/**
 * Complete player state
 * This is the shape of the Zustand store
 */
export interface PlayerState {
  // Current playback
  current: QueueItem | null
  isPlaying: boolean
  currentPosition: number // in seconds
  duration: number // in seconds

  // Audio settings
  volume: number // 0 to 1

  // Queue management
  queue: QueueItem[]
  queueIndex: number // current position in queue
  originalQueue: QueueItem[] // pre-shuffle queue for toggling shuffle

  // Playback modes
  shuffle: boolean
  repeat: RepeatMode

  // Context
  source: PlaySourceMeta | null

  // Analytics
  playAttempts: Map<number, PlayAttempt>
  playCountIncremented: boolean // legacy compat

  // Drawer states (legacy compat)
  isPlaylistDrawerOpen: boolean
  currentPlaylistDrawerId: number | undefined
  isStackDrawerOpen: boolean
  tempStack: unknown | null

  // Computed/derived
  hasNext: boolean
  hasPrev: boolean

  // Actions - Playback control
  playQueue: (opts: {
    items: QueueItem[]
    startIndex?: number
    source?: PlaySourceMeta
  }) => void
  playPause: (force?: boolean) => void
  setIsPlaying: (isPlaying: boolean) => void
  next: () => void
  prev: () => void
  
  // Actions - Seeking & position
  seekTo: (seconds: number) => void
  setCurrentPosition: (seconds: number) => void
  setDuration: (seconds: number) => void

  // Actions - Audio settings
  setVolume: (volume: number) => void

  // Actions - Playback modes
  setRepeat: (mode: RepeatMode) => void
  toggleShuffle: () => void

  // Actions - Analytics
  startPlayAttempt: (songId: number) => void
  reportPlay: (songId: number) => Promise<void>
  setPlayCountIncremented: (incremented: boolean) => void

  // Actions - Drawer management (legacy compat)
  setIsPlaylistDrawerOpen: (isOpen: boolean) => void
  setCurrentPlaylistDrawerId: (id: number | undefined) => void
  openPlaylistDrawer: (playlistId?: number) => void
  closePlaylistDrawer: () => void
  openStackDrawer: (stack: unknown) => void
  closeStackDrawer: () => void
  updateTempStack: (stack: unknown) => void

  // Legacy compatibility
  selectedSong: QueueItem | null // alias for current
  setSelectedSong: (song: QueueItem) => void // wrapper for playQueue
  togglePlayPause: () => void // alias for playPause
  selectedPlaListOrAlbum: unknown | null
  setSelectedPlaListOrAlbum: (album: unknown) => void
}

