/**
 * Data fetching functions for use in React Router loaders
 * Separated from server/index.ts to avoid bundling server setup code
 */
import * as fs from 'fs'
import path from 'path'

import { findAlbumById } from './api/album/album.service'
import { findArtistById } from './api/artist/artist.service'
import { getUserPlaylists } from './api/playlist/playlist.service'
import { getAllUserLibrary } from './api/user-library/user-library.service'

const publicDir = path.resolve('./public')
const staticDataFilePath = path.join(publicDir, '/staticData/allData.json')

// File operations
function loadStaticData() {
  console.log('Loading mock data from:', staticDataFilePath)
  return new Promise(resolve => {
    fs.readFile(staticDataFilePath, 'utf-8', (err, data) => {
      if (err) {
        console.error('Error reading mock data file:', err)
        console.log('Proceeding without mock data')
        resolve({})
        return
      }
      try {
        const parsedData = JSON.parse(data)
        resolve(parsedData)
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError)
        console.log('Proceeding with empty mock data')
        resolve({})
      }
    })
  })
}

export const fetchAllData = async (userId?: number) => {
  const [allData, playlistsData, libraryData] = await Promise.all([
    loadStaticData(),
    userId ? getUserPlaylists(userId) : Promise.resolve([]),
    userId ? getAllUserLibrary(userId) : Promise.resolve([]),
  ])

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sidebar: (allData as Record<string, unknown>)?.sidebar || ([] as any),
    playlists: playlistsData || [],
    library: libraryData || [],
  }
}

export { findAlbumById as fetchAlbumById, findArtistById as fetchArtistById }
