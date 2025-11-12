import type { StackItemWithEntity } from 'server/api/stack/types'
import type { Stack } from 'server/db/stack.entity'

import type { PlaylistVisibilityEnum } from '../../server/db/playlist.entity'

export interface SongDetails {
  index?: number
  title: string
  time: number | null
  imageSrc?: string
  artist?: string
  artistId?: number
  audioUrl?: string
  album?: string
  albumId?: number
  year?: number
  id: number
  plays?: number
}

export interface MenuItem {
  svg: string
  text: string
  action?: string
}

export interface Section {
  title: string
  items: MenuItem[]
}

export interface AlbumArtist {
  id: number
  name: string
  role: string | null
  order: number
  join: string | null
  type: string | null
  gender: string | null
  area: string | null
  image: string | null
  bio: string | null
  tags: string[] | null
  links: Record<string, string> | null
  popularity: number
  verified: boolean
}

export interface AlbumTrack {
  id: number
  title: string
  sortTitle: string | null
  disambiguation: string | null
  trackNumber: number | null
  duration: number | null
  isrc: string | null
  format: string | null
  bitrate: number | null
  sampleRate: number | null
  channels: number | null
  encoding: string | null
  genres: string[] | null
  tags: string[] | null
  explicit: boolean
  playCount: number
  popularity: number
  verified: boolean
  lastPlayed: Date | null
}

export interface AlbumDetail {
  id: number
  title: string
  sortTitle: string | null
  disambiguation: string | null
  releaseDate: Date | null
  albumType: string
  status: string
  packaging: string | null
  country: string | null
  language: string | null
  script: string | null
  barcode: string | null
  catalogNumber: string | null
  label: string | null
  coverArt: string | null
  trackCount: number
  genres: string[] | null
  tags: string[] | null
  notes: string | null
  quality: number
  popularity: number
  verified: boolean
  imageSrc: string
  artist: string
  songs: number[]
  albumArtists: AlbumArtist[]
  tracks: AlbumTrack[]
}
export interface Artist {
  id: number
  imageUrl: string | null
  name: string
  albumsCount: number
}

export type MusicPlaylist = {
  id: number
  title: string
  name?: string
  author?: string
  imageSrc?: string
  description?: string
  songs: SongDetails[]
  suggestions?: SongDetails[]
  visibility?: PlaylistVisibilityEnum
  createdAt?: Date
}

export type PlayerDetails = {
  audioUrl?: string
  imageSrc?: string
  isPlaying: boolean
  title?: string
  artist?: string
  album?: string
  year?: number
  id?: number
}
export type StackItemToEdit = Omit<StackItemWithEntity, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: number
}
export type StackToEdit = Omit<Stack, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: number
  items: StackItemToEdit[]
}
