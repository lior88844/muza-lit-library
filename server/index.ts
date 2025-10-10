import express from "express";
import path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";
import { AlbumService } from "./services/album.service";
import { ArtistService } from "./services/artist.service";
import { TrackService } from "./services/track.service";

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
const STOCK_PHOTO = "/art/muza.png";

// File paths
const __filename = fileURLToPath(import.meta.url);
const clientDir = path.resolve("./server/reactServer/client");
const publicDir = path.resolve("./public");
const staticDataFilePath = path.join(publicDir, "/staticData/allData.json");

function getRandomItems(array: any[], count: number) {
  if (array.length <= count) {
    return array;
  }

  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function transformAlbumData(albums: any[], transformedTracks: any[]) {
  return albums.map(album => ({
    id: album.id,
    imageSrc: album.albumCover || STOCK_PHOTO,
    title: album.albumTitle,
    subTitle: album.yearReleased,
    artist: album.artistMain,
    songs: transformedTracks
      .filter(
        track =>
          track.album === album.albumTitle && track.artist === album.artistMain
      )
      .map(track => track.id),
  }));
}

function transformTrackData(tracks: any[]) {
  return tracks
    .filter(track => track.songFile)
    .map(track => ({
      id: track.id,
      index: track.id,
      title: track.songTitle,
      time: 185,
      albumId: track.albumTitle,
      audioUrl: track.songFile,
      imageSrc: track.albumCover || STOCK_PHOTO,
      artist: track.artistMain,
      album: track.albumTitle,
      year: track.yearReleased,
    }));
}

function transformArtistData(artists: any[], transformedAlbums: any[]) {
  const albumsByArtist: Record<string, number> = transformedAlbums.reduce(
    (acc: Record<string, number>, album) => {
      acc[album.artist] = (acc[album.artist] || 0) + 1;
      return acc;
    },
    {}
  );

  return artists
    .filter(artist => artist.artistMain)
    .map((artist, index) => ({
      id: artist.id || index + 1,
      index: index + 1,
      imageSrc: artist.albumCover || STOCK_PHOTO,
      artistName: artist.artistMain,
      albumsCount: String(albumsByArtist[artist.artistMain] || 0),
    }));
}
async function fetchAlbums() {
  try {
    const data = await albumService.findMany(100, 0);

    return data?.albums;
  } catch (error) {
    console.warn(
      "Failed to fetch albums from GraphQL, using empty array:",
      (error as Error)?.message
    );
    return [];
  }
}

async function fetchTracks() {
  try {
    const data = await trackService.findMany(100, 0);
    return data?.tracks;
  } catch (error) {
    console.warn(
      "Failed to fetch tracks from GraphQL, using empty array:",
      (error as Error)?.message
    );
    return [];
  }
}

async function fetchArtists() {
  try {
    const data = await artistService.findMany(100, 0);
    return data?.artists;
  } catch (error) {
    console.warn(
      "Failed to fetch artists from GraphQL, using empty array:",
      (error as Error)?.message
    );
    return [];
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

    // Middleware
    app.use(express.json());

    // Admin API endpoints
    app.post("/admin/discover", async (req, res): Promise<void> => {
      try {
        console.log("POST /admin/discover - Request received");
        const { metadata } = req.body;

        if (!metadata || !Array.isArray(metadata)) {
          res.status(400).json({
            error: "Invalid request",
            message: "metadata array is required",
          });
          return;
        }

        console.log(`Processing ${metadata.length} album(s) for discovery`);

        // Mock implementation - replace with actual MusicBrainz/Album lookup logic
        const results = metadata.map((item: unknown) => {
          const metadataItem = item as { album?: string; albumArtist?: string };
          console.log(
            `Looking up: "${metadataItem.album}" by ${metadataItem.albumArtist}`
          );

          // TODO: Implement actual album lookup via MusicBrainz API
          // For now, return mock data
          return {
            mbId: `mock-mbid-${Date.now()}`,
            coverUrl: `https://via.placeholder.com/300x300?text=${encodeURIComponent(metadataItem.album || "Unknown")}`,
          };
        });

        console.log(`Returning ${results.length} result(s)`);
        res.json({ results });
      } catch (error) {
        console.error("Error handling /admin/discover request:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });

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

        const response = {
          albums: {
            featured: getRandomItems(albumsData, 125),
            newReleases: getRandomItems(albumsData, 125),
            recommended: getRandomItems(albumsData, 125),
          },
          artists: getRandomItems(artistsData, 125),
          songs: getRandomItems(tracksData, 100000),
          sidebar: (allData as any)?.sidebar || [],
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
