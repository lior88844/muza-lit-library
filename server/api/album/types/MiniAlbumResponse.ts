export interface MiniAlbum {
  id: number
  imageSrc: string
  title: string
  releaseDate: Date | null
  artist: string
  artistId: number
  songs: number[]
}
