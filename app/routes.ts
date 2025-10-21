import { type RouteConfig, route, index } from "@react-router/dev/routes";

export default [
  index("./routes/home.tsx"),
  route("albums", "./routes/albums.tsx"),
  route("albums/:id", "./routes/album.tsx"),
  route("artists", "./routes/artists.tsx"),
  route("songs", "./routes/songs.tsx"),
  route("explore", "./routes/explore.tsx"),
  route("upload", "./routes/upload.tsx"),
  route("admin-upload", "./routes/admin-upload.tsx"),
  route("playlists", "./routes/playlists.tsx"),
  route("playlist", "./routes/playlist.tsx"),
  route("login", "./routes/login.tsx"),
  route("auth/callback", "./routes/callback.tsx"),
  route("health", "./routes/health.tsx"),
] satisfies RouteConfig;
