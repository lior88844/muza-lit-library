import { index, route, type RouteConfig } from '@react-router/dev/routes'
const resourcesRoutes = [route('/api/health', './routes/resources/health.ts'), route('/api/library', './routes/resources/library.ts')]

export default [
  index('./routes/home.tsx'),
  route('albums', './routes/albums.tsx'),
  route('albums/:id', './routes/album.tsx'),
  route('artists', './routes/artists.tsx'),
  route('songs', './routes/songs.tsx'),
  route('explore', './routes/explore.tsx'),
  route('upload', './routes/upload.tsx'),
  route('admin-upload', './routes/admin-upload.tsx'),
  route('playlists', './routes/playlists.tsx'),
  route('playlist', './routes/playlist.tsx'),
  route('login', './routes/login.tsx'),
  route('auth/callback', './routes/callback.tsx'),
  ...resourcesRoutes,
] satisfies RouteConfig
