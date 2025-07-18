import type { Album } from "~/appData/models";
import MusicListSectionComponent from "~/components/listsDisplays/MusicListSection";
import { useMusicLibraryStore } from "~/appData/musicStore";
import { useNavigate } from "react-router";

import "../styles/scrollbar.scss";
import "../styles/variables.scss";
import "../styles/main.scss";

export default function Explore() {
  const { newReleases, featured, recommended } = useMusicLibraryStore();
  const navigate = useNavigate();

  const onAlbumClick = (album: Album) => {
    navigate("/routes/album", { state: { album } });
  };

  const handleShowAll = (sectionTitle: string) => {
    navigate("/routes/albums");
  };

  // Define sections configuration for the loop
  const sections = [
    {
      title: "New Releases",
      albums: newReleases,
    },
    {
      title: "The Classics",
      albums: featured,
    },
    {
      title: "Uncovered Gems",
      albums: recommended,
    },
    {
      title: "Albums",
      albums: featured.concat(recommended),
    },
    {
      title: "The Ones You Missed",
      albums: recommended,
    },
  ];

  return (
    <main>
      <h1>Explore</h1>
      <hr />

      {sections.map((section, index) => (
        <div key={section.title}>
          <MusicListSectionComponent
            title={section.title}
            type="album"
            list={section.albums}
            onShowAll={handleShowAll}
            onAlbumClick={onAlbumClick}
            albums={section.albums}
          />
          <hr />
        </div>
      ))}
    </main>
  );
}
