import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

import type { MusicPlaylist } from '~/store/models'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates playlist cover images from the playlist's songs
 * Takes up to 4 unique album covers from the songs
 * @param playlist - The playlist to generate images for
 * @returns Array of up to 4 image URLs, or null if playlist is empty (should show empty state)
 */
export function generatePlaylistCoverImages(playlist: MusicPlaylist | undefined): string[] | null {
  // Return null for empty playlists - signals that empty state should be shown
  if (!playlist?.songs || playlist.songs.length === 0) {
    return null
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
