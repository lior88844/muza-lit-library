// Simple FLAC metadata extraction without heavy dependencies
// This is a lightweight approach that extracts basic info from file names and structure

export interface SimpleFlacMetadata {
  title?: string
  artist?: string
  album?: string
  albumartist?: string
  year?: number
  track?: { no: number; of?: number }
  folderName: string
  fileName: string
}

/**
 * Extract basic metadata from FLAC file path and name
 * This is a simple approach that doesn't require parsing the actual FLAC tags
 */
export function extractSimpleMetadata(file: File): SimpleFlacMetadata {
  const path = file.webkitRelativePath || file.name
  const fileName = file.name

  // Extract folder structure: Artist/Album/Track.flac
  const pathParts = path.split('/')
  const folderName = pathParts.length > 1 ? pathParts[pathParts.length - 2] : 'Unknown Album'

  // Try to extract info from folder structure
  let artist: string | undefined
  let album: string | undefined

  if (pathParts.length >= 3) {
    // Format: Artist/Album/Track.flac
    artist = pathParts[pathParts.length - 3]
    album = pathParts[pathParts.length - 2]
  } else if (pathParts.length >= 2) {
    // Format: Album/Track.flac
    album = pathParts[pathParts.length - 2]
  }

  // Extract track info from filename
  const trackMatch = fileName.match(/^(\d+)[\s\-.]*(.+)\.flac$/i)
  const trackNumber = trackMatch ? parseInt(trackMatch[1], 10) : undefined
  const title = trackMatch ? trackMatch[2].trim() : fileName.replace('.flac', '')

  // Try to extract year from folder name
  const yearMatch = folderName.match(/\((\d{4})\)|(\d{4})/)
  const year = yearMatch ? parseInt(yearMatch[1] || yearMatch[2], 10) : undefined

  return {
    title: title || fileName.replace('.flac', ''),
    artist,
    album: album || folderName,
    albumartist: artist,
    year,
    track: trackNumber ? { no: trackNumber } : undefined,
    folderName,
    fileName,
  }
}

/**
 * Extract album metadata from the first FLAC file in a folder
 */
export function extractAlbumMetadataSimple(files: File[]): SimpleFlacMetadata | null {
  const flacFiles = files.filter(file => file.name.toLowerCase().endsWith('.flac') || file.type === 'audio/flac')

  if (flacFiles.length === 0) {
    return null
  }

  // Use the first FLAC file to get album metadata
  const firstFile = flacFiles[0]
  const metadata = extractSimpleMetadata(firstFile)

  // Count total tracks in the folder
  if (metadata.track) {
    metadata.track.of = flacFiles.length
  }

  return metadata
}
