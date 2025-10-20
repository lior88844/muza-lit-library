import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
// Use path.join with __dirname to construct the correct path relative to this file
const BUILD_PATH = path.join(__dirname, "../build/server/index.js");
const DEVELOPMENT = process.env.NODE_ENV === "development";
const clientDir = DEVELOPMENT
  ? path.resolve("./build/client")
  : path.resolve("./build/client");

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
          return await source.handler(req, res, next);
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

      // Import the handler using file:// URL for ES modules
      const buildUrl = new URL(`file://${BUILD_PATH}`);
      const { handler } = await import(buildUrl.href);
      app.use(handler);
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
