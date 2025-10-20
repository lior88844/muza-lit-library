import { create } from "zustand";
import type { Album, SongDetails } from "./models";

type currentPlayerStore = {
  selectedSong: SongDetails | null;
  selectedPlaListOrAlbum: Album | null;
  isPlaying: boolean;
  playCountIncremented: boolean;
  isPlaylistDrawerOpen: boolean;
  currentPlaylistDrawerId: string | undefined;
  setIsPlaying: (isPlaying: boolean) => void;
  setSelectedSong: (song: SongDetails) => void;
  setSelectedPlaListOrAlbum: (album: Album) => void;
  togglePlayPause: () => void;
  setPlayCountIncremented: (incremented: boolean) => void;
  setIsPlaylistDrawerOpen: (isOpen: boolean) => void;
  setCurrentPlaylistDrawerId: (id: string | undefined) => void;
  openPlaylistDrawer: (playlistId?: string) => void;
  closePlaylistDrawer: () => void;
};

export const useCurrentPlayerStore = create<currentPlayerStore>((set, get) => ({
  selectedSong: null,
  isPlaying: false,
  selectedPlaListOrAlbum: null,
  playCountIncremented: false,
  isPlaylistDrawerOpen: false,
  currentPlaylistDrawerId: undefined,

  setSelectedSong: (song: SongDetails) =>
    set({ selectedSong: song, playCountIncremented: false }),
  setIsPlaying: (play: boolean) => set({ isPlaying: play }),

  setSelectedPlaListOrAlbum: (album: Album) =>
    set({ selectedPlaListOrAlbum: album }),

  togglePlayPause: () => set({ isPlaying: !get().isPlaying }),

  setPlayCountIncremented: (incremented: boolean) =>
    set({ playCountIncremented: incremented }),

  setIsPlaylistDrawerOpen: (isOpen: boolean) =>
    set({ isPlaylistDrawerOpen: isOpen }),

  setCurrentPlaylistDrawerId: (id: string | undefined) =>
    set({ currentPlaylistDrawerId: id }),

  openPlaylistDrawer: (playlistId?: string) =>
    set({ isPlaylistDrawerOpen: true, currentPlaylistDrawerId: playlistId }),

  closePlaylistDrawer: () =>
    set({ isPlaylistDrawerOpen: false, currentPlaylistDrawerId: undefined }),
}));
