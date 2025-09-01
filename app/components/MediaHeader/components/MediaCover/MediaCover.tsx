import React from "react";
import "./MediaCover.scss";

interface MediaCoverProps {
  imageSrc: string | string[]; // Can be string for single image or array for playlist collage
  title: string;
  mediaType?: "album" | "playlist" | "artist";
  size?: "small" | "medium" | "large";
}

const MediaCover: React.FC<MediaCoverProps> = ({
  imageSrc,
  title,
  mediaType = "album",
  size = "large",
}) => {
  // Generate playlist collage if imageSrc is an array
  const renderCoverContent = () => {
    if (Array.isArray(imageSrc) && imageSrc.length >= 4) {
      return (
        <div className="playlist-collage" data-name="Playlist Collage">
          <div 
            className="collage-item collage-item--top-left"
            style={{ backgroundImage: `url('${imageSrc[0]}')` }}
          />
          <div 
            className="collage-item collage-item--top-right"
            style={{ backgroundImage: `url('${imageSrc[1]}')` }}
          />
          <div 
            className="collage-item collage-item--bottom-left"
            style={{ backgroundImage: `url('${imageSrc[2]}')` }}
          />
          <div 
            className="collage-item collage-item--bottom-right"
            style={{ backgroundImage: `url('${imageSrc[3]}')` }}
          />
        </div>
      );
    }
    
    // For single images (albums, artists, or playlists without enough songs)
    const singleImageSrc = Array.isArray(imageSrc) ? imageSrc[0] || "/art/imag_1.jpg" : imageSrc;
    return <img src={singleImageSrc} alt={title} />;
  };

  return (
    <div className={`cover-section cover-section--${size} cover-section--${mediaType}`} data-name="cover">
      <div className="cover-frame" data-name="cover frame">
        {renderCoverContent()}
        <div className="overlay" data-name="Overlay" />
      </div>
    </div>
  );
};

export default MediaCover;
