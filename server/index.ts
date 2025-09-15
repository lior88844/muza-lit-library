import express from "express";
import { fileURLToPath } from "url";
import axios from "axios";
import path from "path";
import http from "http";
import * as fs from "fs";
import { AlbumService } from "./services/album.service";
import { ArtistService } from "./services/artist.service";
import { TrackService } from "./services/track.service";
import { TrackArtistService } from "./services/track-artist.service";
import type { Album, Artist, Track } from "./schemas";

// Initialize services
const artistService = new ArtistService();
const albumService = new AlbumService();
const trackService = new TrackService();

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
const STOCK_PHOTO = "https://picsum.photos/400"; // Placeholde photo URL

// File paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDir = path.resolve("./server/reactServer/client");
const publicDir = path.resolve("./public");
const staticDataFilePath = path.join(publicDir, "/staticData/allData.json");

// HTTP client setup
const instance = axios.create({
  httpAgent: new http.Agent(),
  timeout: 10000, // 10 second timeout
});

function getRandomItems(array: any[], count: number) {
  if (array.length <= count) {
    return array;
  }

  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function transformAlbumData(albums: Album[], transformedTracks: Track[]) {
  return albums.map(album => ({
    id: album.id,
    imageSrc: album.coverArt || STOCK_PHOTO,
    title: album.title,
    subTitle: album.releaseDate,
    artist: album.artistId,
    songs: transformedTracks
      .filter(
        track => track.albumId === album.id && track.artistId === album.artistId
      )
      .map(track => track.id),
  }));
}

function transformTrackData(tracks: Track[]) {
  return (
    tracks
      // .filter((track) => track.fileId)
      .map(track => ({
        id: track.id,
        index: track.id,
        title: track.title,
        time: 185,
        filePath: track.fileId,
        /* todo converting f
      albumId: track.albumId,
      audioUrl: track.isrc,
      imageSrc: /*join album*/ STOCK_PHOTO,
        artist: "where is my artist???",
        album: track.albumId,
        year: track.createdAt?.getFullYear() || "2023",
      }))
  );
}
function getTrackFilePathFromFileId(fileId: string) {
  return `https://${process.env.CDN_DOMAIN_NAME}/audio/hls/${fileId}/${fileId}.m3u8`;
}
function transformArtistData(artists: Artist[], transformedAlbums: Album[]) {
  const albumsByArtist = transformedAlbums.reduce((acc, album) => {
    acc[album.artistId] = (acc[album.artistId] || 0) + 1;
    return acc;
  }, {});

  return artists
    .filter(artist => artist.name)
    .map((artist, index) => ({
      id: artist.id || index + 1,
      index: index + 1,
      imageSrc: artist.image || STOCK_PHOTO,
      artistName: artist.name,
      albumsCount: String(albumsByArtist[artist.id] || 0),
    }));
}
async function fetchAlbums() {
  try {
    const data = await albumService.findMany(100, 0);

    return data?.albums;
  } catch (error) {
    console.warn(
      "Failed to fetch albums from GraphQL, using empty array:",
      error?.message
    );
    return null;
  }
}

async function fetchTracks() {
  try {
    const data = await trackService.findMany(100, 0);
    return data?.tracks;
  } catch (error) {
    console.warn(
      "Failed to fetch albums from GraphQL, using empty array:",
      error?.message
    );
    return null;
  }
}

async function fetchArtists() {
  try {
    const data = await artistService.findMany(100, 0);
    return data?.artists;
  } catch (error) {
    console.warn(
      "Failed to fetch albums from GraphQL, using empty array:",
      error?.message
    );
    return null;
  }
}

// File operations
function loadStaticData() {
  console.log("Loading mock data from:", staticDataFilePath);
  return new Promise((resolve, reject) => {
    fs.readFile(staticDataFilePath, "utf-8", (err, data) => {
      if (err) {
        console.error("Error reading mock data file:", err);
        console.log("Proceeding without mock data");
        resolve({});
        return;
      }
      try {
        const parsedData = JSON.parse(data);
        console.log("Mock data loaded successfully");
        resolve(parsedData);
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
        console.log("Proceeding with empty mock data");
        resolve({});
      }
    });
  });
}

// Main application logic
async function initializeApp() {
  try {
    console.log("Initializing application...");
    const app = express();

    // API endpoints
    app.get("/staticData/allData.json", async (req, res) => {
      try {
        console.log("GET /staticData/allData.json - Request received");

        // Load data
        const [allData, albumsData, tracksData, artistsData] =
          await Promise.all([
            loadStaticData(),
            fetchAlbums(),
            fetchTracks(),
            fetchArtists(),
          ]);

        console.log(`Loaded ${albumsData?.length} albums from GraphQL`);
        console.log(`Loaded ${tracksData?.length} tracks from GraphQL`);
        console.log(`Loaded ${artistsData?.length} artists from GraphQL`);
        // Transform data
        console.log("Transforming data...");
        const transformedTracks = transformTrackData(tracksData || []);
        const transformedAlbums = transformAlbumData(
          albumsData || [],
          transformedTracks
        );
        const transformedArtists = transformArtistData(
          albumsData || [],
          transformedAlbums
        );

        console.log(
          `Transformed ${transformedAlbums.length} albums with covers`
        );
        console.log(
          `Transformed ${transformedTracks.length} tracks with files and covers`
        );
        console.log(
          `Transformed ${transformedArtists.length} artists with photos`
        );

        const response = {
          albums: {
            featured: getRandomItems(transformedAlbums, 125),
            newReleases: getRandomItems(transformedAlbums, 125),
            recommended: getRandomItems(transformedAlbums, 125),
          },
          artists: getRandomItems(transformedArtists, 125),
          songs: getRandomItems(transformedTracks, 100000),
          sidebar: allData?.sidebar || [],
        };

        console.log(
          `Sending response with ${response.albums?.newReleases?.length || 0} albums, ${response.artists?.length || 0} artists and ${response.songs?.length || 0} songs`
        );
        res.json(response);
      } catch (error) {
        console.error(
          "Error handling /staticData/allData.json request:",
          error
        );
        res.status(500).json({ error: "Internal server error" });
      }
    });

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
