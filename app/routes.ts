import { index, route, type RouteConfig } from '@react-router/dev/routes'
const resourcesRoutes = [
  route('/health', './routes/resources/health.ts'),
  route('/api/library', './routes/resources/library.ts'),
  route('/api/playlist', './routes/resources/playlist.ts'),
  route('/api/search', './routes/resources/search.ts'),
]

export default [
  index('./routes/home.tsx'),
  route('albums', './routes/albums.tsx'),
  route('albums/:id', './routes/album.tsx'),
  route('artists', './routes/artists.tsx'),
  route('artists/:id', './routes/artist/artist-page.tsx'),
  route('songs', './routes/songs.tsx'),
  route('explore', './routes/explore.tsx'),
  route('upload', './routes/upload.tsx'),
  route('admin', './routes/admin.tsx', [
    route('upload', './routes/admin-upload.tsx'),
    route('stack', './routes/admin-stack.tsx'),
    route('data', './routes/admin-data.tsx'),
  ]),
  route('playlists', './routes/playlists.tsx'),
  route('playlists/:id', './routes/playlist.tsx'),
  route('search', './routes/search.tsx'),
  route('login', './routes/login.tsx'),
  route('auth/callback', './routes/callback.tsx'),
  ...resourcesRoutes,
] satisfies RouteConfig
