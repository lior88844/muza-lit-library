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
const isProduction = process.env.NODE_ENV === "production";
const clientDir = isProduction
  ? path.resolve("./build/client")
  : path.resolve("./server/reactServer/client");
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

    // Static file serving
    console.log("Setting up static file serving from:", clientDir);
    app.use(express.static(clientDir));

    // Serve static assets from app directory
    const appDir = path.resolve("./app");
    console.log("Setting up app static file serving from:", appDir);
    app.use("/app", express.static(appDir));

    // Serve static files from the public directory
    console.log("Setting up public file serving from:", publicDir);
    app.use(express.static(publicDir));

    // Health check endpoint
    app.get("/health", (req, res) => {
      console.log("GET /health - Serving OK");
      res.send("OK");
    });

    // Handle favicon requests
    app.get("/favicon.ico", (req, res) => {
      console.log("GET /favicon.ico - Serving favicon");
      res.status(204).end(); // No content response
    });

    app.get("/", (req, res) => {
      console.log("GET / - Serving index.html");
      res.sendFile(path.join(clientDir, "index.html"));
    });

    // Catch-all middleware for client-side routing
    app.use((req, res) => {
      console.log(
        `GET ${req.path} - Serving index.html for client-side routing`
      );
      res.sendFile(path.join(clientDir, "index.html"));
    });

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
