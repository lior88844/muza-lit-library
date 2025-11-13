export interface TrackResponse {
  id: number
  index: number
  title: string
  time: number | null
  audioUrl: string
  year: number
  artistId: number
  albumId: number
  artist: string
  album: string | undefined
  imageSrc: string
  playCount?: number
}
