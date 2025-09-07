import React from "react";
import "./AlbumInfoModal.scss";
import { useTranslation } from "~/lib/i18n/translations";

interface AlbumInfoProps {
  isOpen: boolean;
  onClose: () => void;
}

const AlbumInfoModal: React.FC<AlbumInfoProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="album-info-modal" onClick={onClose}>
      <div
        className="album-info-modal__container"
        onClick={e => e.stopPropagation()}
      >
        <div className="album-info-modal__header">
          <div className="album-info-modal__header-content">
            <h2 className="album-info-modal__title">
              {t("albumInfo.ballads")}
            </h2>
            <p className="album-info-modal__artist">
              {t("albumInfo.johnColtrane")}
            </p>
          </div>
          <button className="album-info-modal__close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="album-info-modal__content">
          <div className="album-info-modal__info-grid">
            <div className="album-info-modal__info-column">
              <div className="album-info-modal__info-group">
                <div className="album-info-modal__info-item">
                  <div className="album-info-modal__info-label">
                    {t("albumInfo.tenorSaxophone")}
                  </div>
                  <div className="album-info-modal__info-value">
                    {t("albumInfo.johnColtraneValue")}
                  </div>
                </div>
                <div className="album-info-modal__info-item">
                  <div className="album-info-modal__info-label">
                    {t("albumInfo.piano")}
                  </div>
                  <div className="album-info-modal__info-value">
                    {t("albumInfo.mccoyTyner")}
                  </div>
                </div>
                <div className="album-info-modal__info-item">
                  <div className="album-info-modal__info-label">
                    {t("albumInfo.bass")}
                  </div>
                  <div className="album-info-modal__info-value">
                    {t("albumInfo.jimmyGarrison")}
                  </div>
                </div>
                <div className="album-info-modal__info-item">
                  <div className="album-info-modal__info-label">
                    {t("albumInfo.drums")}
                  </div>
                  <div className="album-info-modal__info-value">
                    {t("albumInfo.elvinJones")}
                  </div>
                </div>
              </div>

              <div className="album-info-modal__info-group">
                <div className="album-info-modal__info-item">
                  <div className="album-info-modal__info-label">
                    {t("albumInfo.composer")}
                  </div>
                  <div className="album-info-modal__info-value">
                    {t("albumInfo.richardRodgers")}
                  </div>
                </div>
                <div className="album-info-modal__info-item">
                  <div className="album-info-modal__info-label">
                    {t("albumInfo.lyrics")}
                  </div>
                  <div className="album-info-modal__info-value">
                    {t("albumInfo.lorenzHart")}
                  </div>
                </div>
              </div>

              <div className="album-info-modal__info-group">
                <div className="album-info-modal__info-item">
                  <div className="album-info-modal__info-label">
                    {t("albumInfo.recordedOn")}
                  </div>
                  <div className="album-info-modal__info-value">
                    {t("albumInfo.recordingDate")}
                  </div>
                </div>
                <div className="album-info-modal__info-item">
                  <div className="album-info-modal__info-label">
                    {t("albumInfo.recordedBy")}
                  </div>
                  <div className="album-info-modal__info-value">
                    {t("albumInfo.rudyVanGelder")}
                  </div>
                </div>
                <div className="album-info-modal__info-item">
                  <div className="album-info-modal__info-label">
                    {t("albumInfo.producedBy")}
                  </div>
                  <div className="album-info-modal__info-value">
                    {t("albumInfo.bobThiele")}
                  </div>
                </div>
                <div className="album-info-modal__info-item">
                  <div className="album-info-modal__info-label">
                    {t("albumInfo.label")}
                  </div>
                  <div className="album-info-modal__info-value">
                    {t("albumInfo.impulseRecords")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlbumInfoModal;
