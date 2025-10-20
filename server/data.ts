/**
 * Data fetching functions for use in React Router loaders
 * Separated from server/index.ts to avoid bundling server setup code
 */
import path from "path";
import * as fs from "fs";
import { findManyAlbums, findAlbumById } from "./api/album/album.service";
import { findArtistById, findManyArtists } from "./api/artist/artist.service";
import { findManyTracks } from "./api/track/track.service";

const publicDir = path.resolve("./public");
const staticDataFilePath = path.join(publicDir, "/staticData/allData.json");

function getRandomItems<T>(array: T[], count: number) {
  if (array.length <= count) {
    return array;
  }

  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

async function fetchAlbums() {
  try {
    const data = await findManyAlbums(100, 0);
    return data?.albums || [];
  } catch (error) {
    console.log(error);
    return [];
  }
}

async function fetchTracks() {
  try {
    const data = await findManyTracks(100, 0);
    return data?.tracks || [];
  } catch (error) {
    console.warn(
      "Failed to fetch tracks, using empty array:",
      (error as Error)?.message
    );
    return [];
  }
}

async function fetchArtists() {
  try {
    const data = await findManyArtists(100, 0);
    return data?.artists || [];
  } catch (error) {
    console.warn(
      "Failed to fetch artists, using empty array:",
      (error as Error)?.message
    );
    return [];
  }
}

// File operations
function loadStaticData() {
  console.log("Loading mock data from:", staticDataFilePath);
  return new Promise(resolve => {
    fs.readFile(staticDataFilePath, "utf-8", (err, data) => {
      if (err) {
        console.error("Error reading mock data file:", err);
        console.log("Proceeding without mock data");
        resolve({});
        return;
      }
      try {
        const parsedData = JSON.parse(data);
        resolve(parsedData);
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
        console.log("Proceeding with empty mock data");
        resolve({});
      }
    });
  });
}

export const fetchAllData = async () => {
  const [allData, albumsData, tracksData, artistsData] = await Promise.all([
    loadStaticData(),
    fetchAlbums(),
    fetchTracks(),
    fetchArtists(),
  ]);

  console.log(`Loaded ${albumsData?.length} albums`);
  console.log(`Loaded ${tracksData?.length} tracks`);
  console.log(`Loaded ${artistsData?.length} artists`);

  return {
    albums: {
      featured: getRandomItems(albumsData, 125),
      newReleases: getRandomItems(albumsData, 125),
      recommended: getRandomItems(albumsData, 125),
    },
    artists: getRandomItems(artistsData, 125),
    songs: getRandomItems(tracksData, 100000),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sidebar: (allData as Record<string, unknown>)?.sidebar || ([] as any),
    playlists: [],
  };
};

export { findAlbumById as fetchAlbumById, findArtistById as fetchArtistById };
