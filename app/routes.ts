import { index, route, type RouteConfig } from '@react-router/dev/routes'
const resourcesRoutes = [
  route('/health', './routes/resources/health.ts'),
  route('/api/library', './routes/resources/library.ts'),
  route('/api/playlist', './routes/resources/playlist.ts'),
]

export default [
  index('./routes/home.tsx'),
  route('albums', './routes/albums.tsx'),
  route('albums/:id', './routes/album.tsx'),
  route('artists', './routes/artists.tsx'),
  route('artists/:id', './routes/artist.tsx'),
  route('songs', './routes/songs.tsx'),
  route('explore', './routes/explore.tsx'),
  route('upload', './routes/upload.tsx'),
  route('admin-upload', './routes/admin-upload.tsx'),
  route('playlists', './routes/playlists.tsx'),
  route('playlists/:id', './routes/playlist.tsx'),
  route('login', './routes/login.tsx'),
  route('auth/callback', './routes/callback.tsx'),
  ...resourcesRoutes,
] satisfies RouteConfig
