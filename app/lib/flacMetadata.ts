import { parseBlob } from 'music-metadata'

import type { UploadItem } from '~/components/adminUpload/types/UploadItem'

export interface FlacMetadata {
  title?: string
  artist?: string
  album?: string
  albumartist?: string
  year?: number
  genre?: string
  track?: { no: number; of?: number }
  disk?: { no: number; of?: number }
  duration?: number
  musicbrainzAlbumId?: string
  musicbrainzArtistId?: string
  musicbrainzReleaseGroupId?: string
}

// Complete metadata for admin discover endpoint
export interface FileMetadata {
  artist: string
  album: string
  title: string
  trackTotal: number
  musicbrainzAlbumId?: string
}
export interface DiscoverMetadata {
  artist: string
  album: string
  tracks: { title: string; artist: string; discNumber?: number }[]
  musicbrainzAlbumId?: string
}

/**
 * Extract metadata from a FLAC file
 */
export async function extractFlacMetadata(file: File): Promise<FlacMetadata | null> {
  try {
    const metadata = await parseBlob(file)

    return {
      title: metadata.common.title,
      artist: metadata.common.artist,
      album: metadata.common.album,
      albumartist: metadata.common.albumartist,
      year: metadata.common.year,
      genre: Array.isArray(metadata.common.genre)
        ? metadata.common.genre.join(', ')
        : typeof metadata.common.genre === 'string'
          ? metadata.common.genre
          : undefined,
      track:
        metadata.common.track && metadata.common.track.no !== null
          ? {
              no: metadata.common.track.no,
              of: metadata.common.track.of || undefined,
            }
          : undefined,
      disk:
        metadata.common.disk && metadata.common.disk.no !== null
          ? {
              no: metadata.common.disk.no,
              of: metadata.common.disk.of || undefined,
            }
          : undefined,
      duration: metadata.format.duration,
      musicbrainzAlbumId: Array.isArray(metadata.common.musicbrainz_albumid)
        ? metadata.common.musicbrainz_albumid[0]
        : metadata.common.musicbrainz_albumid,
      musicbrainzArtistId: Array.isArray(metadata.common.musicbrainz_artistid)
        ? metadata.common.musicbrainz_artistid[0]
        : metadata.common.musicbrainz_artistid,
      musicbrainzReleaseGroupId: Array.isArray(metadata.common.musicbrainz_releasegroupid)
        ? metadata.common.musicbrainz_releasegroupid[0]
        : metadata.common.musicbrainz_releasegroupid,
    }
  } catch {
    // Error extracting FLAC metadata - could add proper logging here
    return null
  }
}

/**
 * Extract metadata from the first FLAC file in a folder to represent the album
 */
export async function extractAlbumMetadata(files: File[]): Promise<FlacMetadata | null> {
  const flacFiles = files.filter(
    file => file.name.toLowerCase().endsWith('.flac') || file.type === 'audio/flac'
  )

  if (flacFiles.length === 0) {
    return null
  }

  // Use the first FLAC file to get album metadata
  return await extractFlacMetadata(flacFiles[0])
}

/**
 * Extract complete metadata from a FLAC file for the admin discover endpoint
 */
export async function extractDiscoverMetadata(file: File) {
  try {
    const metadata = await parseBlob(file)

    // Extract musicbrainz album ID if available
    const musicbrainzAlbumId = Array.isArray(metadata.common.musicbrainz_albumid)
      ? metadata.common.musicbrainz_albumid[0]
      : metadata.common.musicbrainz_albumid

    return {
      artist: metadata.common.artist || 'Unknown Artist',
      album: metadata.common.album || 'Unknown Album',
      title: metadata.common.title || file.name.replace(/\.flac$/i, ''),
      trackTotal: metadata.common.track?.of || 0,
      musicbrainzAlbumId: musicbrainzAlbumId || undefined,
      discNumber: metadata.common.disk?.no || undefined,
    }
  } catch {
    // Error extracting discover metadata - could add proper logging here
    return null
  }
}

/**
 * Extract complete metadata from the first FLAC file in a folder for discover endpoint
 */
export async function extractAlbumDiscoverMetadata(
  item: UploadItem
): Promise<DiscoverMetadata | null> {
  const metadataResults = await Promise.all(
    item.files.map(async files => {
      const metadata = await Promise.all(
        files.map(async file => {
          return await extractDiscoverMetadata(file)
        })
      )
      return metadata.filter(metadata => metadata !== null)
    })
  )
  const allMetadata = metadataResults.flat()
  const artist = getMostCommonValue(allMetadata.map(metadata => metadata?.artist))
  const album = getMostCommonValue(allMetadata.map(metadata => metadata?.album))
  const musicbrainzAlbumId = getMostCommonValue(
    allMetadata.map(metadata => metadata?.musicbrainzAlbumId)
  )
  const tracks = metadataResults
    .map((metadatas, discNum) =>
      metadatas.map(metadata => ({
        title: metadata?.title || '',
        artist: metadata?.artist || '',
        discNumber: discNum + 1,
      }))
    )
    .flat()
  return {
    artist,
    album,
    tracks,
    musicbrainzAlbumId: musicbrainzAlbumId || undefined,
  }
}
const getMostCommonValue = (values: (string | undefined | number)[]): string => {
  const filteredValues = values.filter(value => value !== undefined && value !== null)
  const valueCounts = filteredValues.reduce(
    (acc, value) => {
      if (value !== undefined && value !== null) {
        acc[value] = (acc[value] || 0) + 1
      }
      return acc
    },
    {} as Record<string, number>
  )

  if (Object.keys(valueCounts).length === 0) {
    return ''
  }

  return Object.keys(valueCounts).reduce((a, b) => (valueCounts[a] > valueCounts[b] ? a : b))
}

/**
 * Extract complete metadata from a file for the prepare upload endpoint
 * Returns all metadata needed by the backend for track matching and creation
 */
export async function extractFullFileMetadata(file: File): Promise<{
  fileName: string
  fileSize: number
  mimetype: string
  title?: string
  artist?: string
  trackNumber?: number
  discNumber?: number
  duration?: number
  format?: string
  bitrate?: number
  sampleRate?: number
  channels?: number
  isrc?: string
  musicbrainzTrackId?: string
  mbRecordingId?: string
} | null> {
  try {
    const metadata = await parseBlob(file)

    return {
      fileName: file.name,
      fileSize: file.size,
      mimetype: file.type || 'audio/flac',
      title: metadata.common.title,
      artist: metadata.common.artist,
      trackNumber: metadata.common.track?.no ?? undefined,
      discNumber: metadata.common.disk?.no ?? undefined,
      duration: metadata.format.duration ? Math.round(metadata.format.duration) : undefined,
      format: metadata.format.container?.toUpperCase(),
      bitrate: metadata.format.bitrate,
      sampleRate: metadata.format.sampleRate,
      channels: metadata.format.numberOfChannels,
      isrc: Array.isArray(metadata.common.isrc) ? metadata.common.isrc[0] : metadata.common.isrc,
      musicbrainzTrackId: Array.isArray(metadata.common.musicbrainz_trackid)
        ? metadata.common.musicbrainz_trackid[0]
        : metadata.common.musicbrainz_trackid,
      mbRecordingId: Array.isArray(metadata.common.musicbrainz_recordingid)
        ? metadata.common.musicbrainz_recordingid[0]
        : metadata.common.musicbrainz_recordingid,
    }
  } catch (error) {
    console.error('Error extracting full file metadata:', error)
    return null
  }
}
