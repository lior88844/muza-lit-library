import type { MusicPlaylist } from '~/store/models'

/**
 * Generates playlist cover images from the playlist's songs
 * Takes up to 4 unique album covers from the songs
 * @param playlist - The playlist to generate images for
 * @returns Array of up to 4 image URLs
 */
export function generatePlaylistCoverImages(playlist: MusicPlaylist | undefined): string[] {
  if (!playlist?.songs || playlist.songs.length === 0) {
    return ['/art/muza.png']
  }

  const uniqueImages: string[] = []
  const seenImages = new Set<string>()

  // Collect unique album covers from songs
  for (const song of playlist.songs) {
    const imageSrc = song.imageSrc || '/art/muza.png'

    if (!seenImages.has(imageSrc)) {
      seenImages.add(imageSrc)
      uniqueImages.push(imageSrc)

      // Stop when we have 4 unique images
      if (uniqueImages.length >= 4) {
        break
      }
    }
  }

  // If we have less than 4, pad with the first image or default
  const defaultImage = uniqueImages[0] || '/art/muza.png'
  while (uniqueImages.length < 4) {
    uniqueImages.push(defaultImage)
  }

  return uniqueImages
}
