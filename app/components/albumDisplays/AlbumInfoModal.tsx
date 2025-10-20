import React from "react";
import "./AlbumInfoModal.scss";
import { useTranslation } from "~/lib/i18n/translations";
import MuzaIcon from "~/icons/MuzaIcon";
import type { AlbumResponse } from "../../../server/api/album/types/AlbumResponse";

interface AlbumInfoProps {
  isOpen: boolean;
  album: AlbumResponse;
  onClose: () => void;
}

const AlbumInfoModal: React.FC<AlbumInfoProps> = ({
  isOpen,
  album,
  onClose,
}) => {
  if (!isOpen) return null;

  const formatDate = (date: Date | null) => {
    if (!date) return "Unknown";
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="album-info-modal" onClick={onClose}>
      <div
        className="album-info-modal__container"
        onClick={e => e.stopPropagation()}
      >
        <div
          className="album-info-modal__header"
          style={{
            background: `linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.98) 100%),
      url(${album.coverArt}) no-repeat center center / contain`,
          }}
        >
          <div className="album-info-modal__header-content">
            <h2 className="album-info-modal__title">{album.title}</h2>
            <p className="album-info-modal__artist">{album.artist.name}</p>
          </div>
          <button className="album-info-modal__close" onClick={onClose}>
            <MuzaIcon iconName="Close" />
          </button>
        </div>

        <div className="album-info-modal__content">
          <div className="album-info-modal__info-grid">
            <div className="album-info-modal__info-column">
              {/* Album Artists */}
              <div className="album-info-modal__info-group">
                {album.otherArtists.map(artist => (
                  <div key={artist.id} className="album-info-modal__info-item">
                    <div className="album-info-modal__info-label">
                      {artist.role || "Member"}
                    </div>
                    <div className="album-info-modal__info-value">
                      {artist.name}
                    </div>
                  </div>
                ))}
              </div>

              {/* Album Information */}
              <div className="album-info-modal__info-group">
                <h3 className="album-info-modal__group-title">
                  Album Information
                </h3>
                <div className="album-info-modal__info-item">
                  <div className="album-info-modal__info-label">
                    Release Date
                  </div>
                  <div className="album-info-modal__info-value">
                    {formatDate(album.releaseDate)}
                  </div>
                </div>
                <div className="album-info-modal__info-item">
                  <div className="album-info-modal__info-label">Album Type</div>
                  <div className="album-info-modal__info-value">
                    {album.albumType}
                  </div>
                </div>
                <div className="album-info-modal__info-item">
                  <div className="album-info-modal__info-label">Status</div>
                  <div className="album-info-modal__info-value">
                    {album.status}
                  </div>
                </div>
                <div className="album-info-modal__info-item">
                  <div className="album-info-modal__info-label">
                    Track Count
                  </div>
                  <div className="album-info-modal__info-value">
                    {album.trackCount}
                  </div>
                </div>
                {album.label && (
                  <div className="album-info-modal__info-item">
                    <div className="album-info-modal__info-label">Label</div>
                    <div className="album-info-modal__info-value">
                      {album.label}
                    </div>
                  </div>
                )}
                {album.catalogNumber && (
                  <div className="album-info-modal__info-item">
                    <div className="album-info-modal__info-label">
                      Catalog Number
                    </div>
                    <div className="album-info-modal__info-value">
                      {album.catalogNumber}
                    </div>
                  </div>
                )}
                {album.barcode && (
                  <div className="album-info-modal__info-item">
                    <div className="album-info-modal__info-label">Barcode</div>
                    <div className="album-info-modal__info-value">
                      {album.barcode}
                    </div>
                  </div>
                )}
              </div>

              {/* Genres and Tags */}
              {album.genres && album.genres.length > 0 && (
                <div className="album-info-modal__info-group">
                  <h3 className="album-info-modal__group-title">Genres</h3>
                  <div className="album-info-modal__info-item">
                    <div className="album-info-modal__info-value">
                      {album.genres.join(", ")}
                    </div>
                  </div>
                </div>
              )}

              {album.tags && album.tags.length > 0 && (
                <div className="album-info-modal__info-group">
                  <h3 className="album-info-modal__group-title">Tags</h3>
                  <div className="album-info-modal__info-item">
                    <div className="album-info-modal__info-value">
                      {album.tags.join(", ")}
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {album.notes && (
                <div className="album-info-modal__info-group">
                  <h3 className="album-info-modal__group-title">Notes</h3>
                  <div className="album-info-modal__info-item">
                    <div className="album-info-modal__info-value">
                      {album.notes}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlbumInfoModal;
