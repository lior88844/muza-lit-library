import './app.scss'

import { useEffect, useState } from 'react'
import { useMemo } from 'react'
import {
  isRouteErrorResponse,
  Links,
  Meta,
  type MiddlewareFunction,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
} from 'react-router'

import { fetchAllData } from '../server/data'
import type { Route } from './+types/root'
import MuzaMusicPlayer from './components/componentsWithLogic/MuzaMusicPlayer'
import PlaylistDrawer from './components/playlistDisplays/PlaylistDrawer'
import MusicSidebar from './components/sections/MusicSidebar'
import MusicTopbar from './components/sections/MusicTopbar'
import { useTranslation } from './lib/i18n/translations'
import Providers from './Providers'
import { useCurrentPlayerStore } from './store/currentPlayerStore'
import { MediaContext } from './store/media/mediaContext'
import type { MusicPlaylist } from './store/models'
import { usePlaylistStore } from './store/playlistStore'
import { userContext } from './store/router-context'

export const authMiddleware: MiddlewareFunction = async ({ context }) => {
  // const user = await getOidcUser();
  context.set(userContext, {
    id: 1,
  })
}
export const middleware: MiddlewareFunction[] = [authMiddleware]

export async function loader({ context }: Route.LoaderArgs) {
  const user = context.get(userContext)
  const res = await fetchAllData(user?.id)
  return res
}

// Prevent unnecessary revalidation - only revalidate on explicit actions
export function shouldRevalidate({ actionStatus }: { actionStatus?: number }) {
  // Revalidate if there was an action (mutation)
  if (actionStatus) {
    return true
  }
  // Don't revalidate on navigation
  return false
}

export const links: Route.LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
  {
    rel: 'stylesheet',
    href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css',
  },
]

const MINIMAL_LAYOUT_PAGES = ['/admin-upload', '/admin-portal', '/upload']

export function Layout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation()
  const location = useLocation()
  const { setIsPlaying } = useCurrentPlayerStore()

  const data = useLoaderData<typeof loader>()

  // Process playlists once with useMemo
  const processedData = useMemo(() => {
    const songs = data?.songs || []
    return {
      albums: {
        featured: data?.albums?.featured || [],
        newReleases: (data?.albums?.newReleases || []).slice(0, 5),
        recommended: data?.albums?.recommended || [],
      },
      artists: data?.artists || [],
      songs,
      library: data?.library || [],
      playlists: data?.playlists || [],
      sidebar: {
        sections: data?.sidebar?.sections || [],
      },
    }
  }, [data])

  const sidebarSections = processedData.sidebar.sections
  const playlists = processedData.playlists

  const { isPlaylistDrawerOpen, openPlaylistDrawer, closePlaylistDrawer } =
    useCurrentPlayerStore()

  // Initialize playlist store with loader data
  useEffect(() => {
    usePlaylistStore.getState().initialize(playlists)
  }, [playlists])

  const playlistsFromStore = usePlaylistStore(state => state.playlists)

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  // Check if we're on pages that should hide the main music UI
  const isMinimalLayoutPage = MINIMAL_LAYOUT_PAGES.includes(location.pathname)

  // Stop music when navigating to upload pages
  useEffect(() => {
    if (isMinimalLayoutPage) {
      setIsPlaying(false)
    }
  }, [isMinimalLayoutPage, setIsPlaying])

  // Handle playlist drawer state changes
  const handleOpenPlaylistDrawer = (playlist?: MusicPlaylist) => {
    openPlaylistDrawer(playlist?.id)
    setIsSidebarCollapsed(true)
  }

  const handleClosePlaylistDrawer = () => {
    closePlaylistDrawer()
    setIsSidebarCollapsed(false)
  }

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  // Initialize current player with first song only once
  useEffect(() => {
    const { selectedSong, setSelectedSong } = useCurrentPlayerStore.getState()
    const songs = processedData.songs

    if (songs.length > 0 && !selectedSong) {
      setSelectedSong(songs[0])
    }
  }, [processedData.songs])

  const content = null

  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <Meta />
        <Links />
      </head>
      <body>
        <Providers>
          <MediaContext.Provider value={processedData}>
            <div className={`body ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
              {!isMinimalLayoutPage && (
                <MusicSidebar
                  logoAlt={t('library.musicLibrary')}
                  logoSrc='/icons/muza.svg'
                  sections={sidebarSections}
                  playlists={playlistsFromStore}
                  isCollapsed={isSidebarCollapsed}
                  _onOpenPlaylistDrawer={handleOpenPlaylistDrawer}
                  onToggleCollapse={handleToggleSidebar}
                />
              )}

              <div className='content'>
                {!isMinimalLayoutPage && <MusicTopbar />}
                <main className={isMinimalLayoutPage ? 'minimal-layout-main' : ''}>
                  {content || children}
                  {!isMinimalLayoutPage && (
                    <PlaylistDrawer
                      isOpen={isPlaylistDrawerOpen}
                      onClose={handleClosePlaylistDrawer}
                    />
                  )}
                </main>
                {!isMinimalLayoutPage && <MuzaMusicPlayer />}
              </div>
            </div>
          </MediaContext.Provider>
        </Providers>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!'
  let details = 'An unexpected error occurred.'
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error'
    details =
      error.status === 404 ? 'The requested page could not be found.' : error.statusText || details
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message
    stack = error.stack
  }

  return (
    <main className='container mx-auto p-4 pt-16'>
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className='w-full overflow-x-auto p-4'>
          <code>{stack}</code>
        </pre>
      )}
    </main>
  )
}
