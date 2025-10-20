import express from "express";
import path from "path";
import * as fs from "fs";
import { findManyAlbums } from "./api/album/album.service";
import { findArtistById, findManyArtists } from "./api/artist/artist.service";
import { findManyTracks } from "./api/track/track.service";
import { findAlbumById } from "./api/album/album.service";

// Add global error handlers to prevent unexpected exits
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  // Don't exit the process, just log the error
});

process.on("uncaughtException", error => {
  console.error("Uncaught Exception:", error);
  // Don't exit the process, just log the error
});

const PORT = process.env.PORT || 3000;

// Determine the correct paths based on environment
const BUILD_PATH = "./build/server/index.js";
const DEVELOPMENT = process.env.NODE_ENV === "development";
const clientDir = DEVELOPMENT
  ? path.resolve("./build/client")
  : path.resolve("./build/client");
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

    // console.warn(
    //   "Failed to fetch albums, using empty array:",
    //   (error as Error)?.message
    // );
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

export const fetchAlbumById = async (id: number) => {
  try {
    const albumData = await findAlbumById(id);
    return albumData;
  } catch (error) {
    console.error("Failed to fetch album:", (error as Error)?.message);
    return null;
  }
};

export const fetchArtistById = async (id: number) => {
  try {
    const artistData = await findArtistById(id);
    return artistData;
  } catch (error) {
    console.error("Failed to fetch artist:", (error as Error)?.message);
    return null;
  }
};
// Main application logic
async function initializeApp() {
  try {
    console.log("Initializing application...");
    const app = express();

    // Middleware
    app.use(express.json());

    // Health check endpoint
    app.get("/health", (req, res) => {
      res.send("OK");
    });
    console.log({ isDevelopment: DEVELOPMENT });

    if (DEVELOPMENT) {
      console.log("Starting development server");
      const viteDevServer = await import("vite").then(vite =>
        vite.createServer({
          server: { middlewareMode: true },
        })
      );
      app.use(viteDevServer.middlewares);
      app.use(async (req, res, next) => {
        try {
          const source = await viteDevServer.ssrLoadModule("./server/app.ts");
          return await source.app(req, res, next);
        } catch (error) {
          if (typeof error === "object" && error instanceof Error) {
            viteDevServer.ssrFixStacktrace(error);
          }
          next(error);
        }
      });
    } else {
      console.log("Starting production server");
      app.use(
        "/assets",
        express.static("build/client/assets", { immutable: true, maxAge: "1y" })
      );
      app.use(express.static("build/client", { maxAge: "1h" }));
      app.use(await import(BUILD_PATH).then(mod => mod.app));
    }

    // Start server
    const server = app.listen(PORT, () => {
      console.log(`✅ Server running at http://localhost:${PORT}`);
      console.log(`📁 Serving static files from: ${clientDir}`);
      console.log(`🚀 Server is ready to accept connections`);
      console.log(
        `🔗 Using internal ECS service discovery for API communication`
      );
    });

    // Add error handling for the server
    server.on("error", error => {
      console.error("Server error:", error);
    });

    // Keep the process alive
    process.on("SIGINT", () => {
      console.log("Received SIGINT, shutting down gracefully...");
      server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });
    });

    process.on("SIGTERM", grace => {
      console.log("Received SIGTERM, shutting down gracefully...", grace);
      server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("❌ Failed to initialize application:", error);
    process.exit(1);
  }
}

// Start the application
initializeApp();
