import { ThemeModeScript } from "flowbite-react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
} from "react-router";
import type { Route } from "./+types/root";

import "./app.scss";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MusicSidebar from "./components/sections/MusicSidebar";
import MusicTopbar from "./components/sections/MusicTopbar";
import { useMusicLibraryStore } from "./appData/musicStore";
import { useEffect, useState } from "react";
import { useCurrentPlayerStore } from "./appData/currentPlayerStore";
import MuzaMusicPlayer from "./components/componentsWithLogic/MuzaMusicPlayer";
import { useTranslation } from "./lib/i18n/translations";
import type { SongDetails, MusicPlaylist } from "./appData/models";
import Providers from "./Providers";
import PlaylistDrawer from "./components/playlistDisplays/PlaylistDrawer";
import { fetchAllData } from "../server";

export async function loader({ request }: Route.LoaderArgs) {
  const res = await fetchAllData();
  return res;
}

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  {
    rel: "stylesheet",
    href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const location = useLocation();
  const { setIsPlaying } = useCurrentPlayerStore();
  const sidebarSections = useMusicLibraryStore(state => state.sidebarSections);
  const playlists = useMusicLibraryStore(state => state.playlists);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const data = useLoaderData<typeof loader>();

  const {
    isPlaylistDrawerOpen,
    currentPlaylistDrawerId,
    openPlaylistDrawer,
    closePlaylistDrawer,
  } = useCurrentPlayerStore();

  // Get the current playlist from the store to keep it reactive
  const currentPlaylist = useMusicLibraryStore(state =>
    currentPlaylistDrawerId
      ? state.playlists.find(p => p.id === currentPlaylistDrawerId)
      : undefined
  );
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Check if we're on pages that should hide the main music UI
  const isUploadPage = location.pathname === "/upload";
  const isAdminUploadPage = location.pathname === "/admin-upload";
  const isAdminPortalPage = location.pathname === "/admin-portal";
  const isMinimalLayoutPage =
    isUploadPage || isAdminUploadPage || isAdminPortalPage;

  // Stop music when navigating to upload pages
  useEffect(() => {
    if (isMinimalLayoutPage) {
      setIsPlaying(false);
    }
  }, [isMinimalLayoutPage, setIsPlaying]);

  // Handle playlist drawer state changes
  const handleOpenPlaylistDrawer = (playlist?: MusicPlaylist) => {
    openPlaylistDrawer(playlist?.id);
    setIsSidebarCollapsed(true);
  };

  const handleClosePlaylistDrawer = () => {
    closePlaylistDrawer();
    setIsSidebarCollapsed(false);
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const { updatePlaylist } = useMusicLibraryStore();

  const handleSavePlaylist = (playlist: Partial<MusicPlaylist>) => {
    // Handle playlist save logic here
    console.log("Saving playlist:", playlist);
    if (currentPlaylistDrawerId) {
      updatePlaylist(currentPlaylistDrawerId, playlist);
    }
  };

  useEffect(() => {
    const {
      setNewReleases,
      setFeatured,
      setArtists,
      setRecommended,
      setRecentlyPlayed,
      setPlaylists,
      setSidebarSections,
    } = useMusicLibraryStore.getState();

    const { selectedSong, setSelectedSong } = useCurrentPlayerStore.getState();

    const albums = data?.albums;
    const artists = data?.artists || [];
    const songs = data?.songs || [];

    setFeatured(albums.featured);
    setNewReleases((albums.newReleases || []).slice(0, 5));
    setRecommended(albums.recommended || []);
    setArtists(artists);
    setRecentlyPlayed(songs);

    const processedPlaylists = (data?.playlists || []).map((playlist: any) => {
      const playlistSongs = (playlist.songs || [])
        .map((id: number) => songs.find((song: SongDetails) => song.id === id))
        .filter(
          (song: SongDetails | undefined): song is SongDetails =>
            song !== undefined
        );

      const playlistSuggestions = (playlist.suggestions || [])
        .map((songId: number) =>
          songs.find((song: SongDetails) => song.id === songId)
        )
        .filter(
          (song: SongDetails | undefined): song is SongDetails =>
            song !== undefined
        );

      return {
        ...playlist,
        songs: playlistSongs,
        suggestions: playlistSuggestions,
        author: playlist.author,
      };
    });

    setPlaylists(processedPlaylists);
    setSidebarSections(data?.sidebar?.sections || []);

    if (songs.length > 0 && !selectedSong) {
      setSelectedSong(songs[0]);
    }
  }, [data]);

  const content = null;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <ThemeModeScript />
      </head>
      <body>
        <Providers>
          <div
            className={`body ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}
          >
            {!isMinimalLayoutPage && (
              <MusicSidebar
                logoAlt={t("library.musicLibrary")}
                logoSrc="/icons/muza.svg"
                sections={sidebarSections}
                playlists={playlists}
                isCollapsed={isSidebarCollapsed}
                onOpenPlaylistDrawer={handleOpenPlaylistDrawer}
                onToggleCollapse={handleToggleSidebar}
              />
            )}

            <div className="content">
              {!isMinimalLayoutPage && <MusicTopbar />}
              <main>
                {content || children}
                {!isMinimalLayoutPage && (
                  <PlaylistDrawer
                    isOpen={isPlaylistDrawerOpen}
                    onClose={handleClosePlaylistDrawer}
                    playlist={currentPlaylist}
                    onSavePlaylist={handleSavePlaylist}
                  />
                )}
              </main>
              {!isMinimalLayoutPage && <MuzaMusicPlayer />}
            </div>
          </div>
          <ToastContainer />
        </Providers>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="container mx-auto p-4 pt-16">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full overflow-x-auto p-4">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
