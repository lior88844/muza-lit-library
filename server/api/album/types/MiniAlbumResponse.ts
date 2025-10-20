export interface MiniAlbumResponse {
  id: number;
  imageSrc: string;
  title: string;
  releaseDate: Date | null;
  artist: string;
  songs: number[];
}
