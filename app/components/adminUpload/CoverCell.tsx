import React, { useState, useCallback } from "react";
import MuzaIcon from "~/icons/MuzaIcon";
import type { UploadItem } from "./types/UploadItem";
import { UploadErrorCodeEnum } from "./types/ErrorCode";

interface CoverCellProps {
  item: UploadItem;
  onCoverUrlChange: (itemId: string, url: string | undefined) => void;
}

const CoverCell: React.FC<CoverCellProps> = ({ item, onCoverUrlChange }) => {
  const [inputValue, setInputValue] = useState(item.coverImageUrl || "");

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);

      // Pass the URL value to parent, or undefined if empty
      onCoverUrlChange(item.id, value.trim() || undefined);
    },
    [item.id, onCoverUrlChange]
  );

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInputValue("");
    onCoverUrlChange(item.id, undefined);
  };

  // Don't show anything for items with critical error 1001 (no FLAC files)
  if (item.errorCode === UploadErrorCodeEnum.ALL_FILES_INVALID) {
    return <div className="admin-upload-table__cover-cell">-</div>;
  }

  // Show loading state while looking up
  if (item.isLookingUp) {
    return <div className="admin-upload-table__cover-cell" />;
  }

  // Show cover image if available from discovery
  if (item.albumLookup?.coverUrl) {
    return (
      <div className="admin-upload-table__cover-cell">
        <div className="admin-upload-table__cover-image-container">
          <img
            src={item.albumLookup.coverUrl}
            alt={`${item.name} cover`}
            className="admin-upload-table__cover-image"
          />
          <button
            className="admin-upload-table__cover-remove-btn"
            onClick={handleRemoveClick}
            aria-label="Remove cover image"
          >
            <MuzaIcon
              iconName="Close"
              className="admin-upload-table__remove-icon"
            />
          </button>
        </div>
      </div>
    );
  }

  // Show manually entered cover image URL
  if (item.coverImageUrl) {
    return (
      <div className="admin-upload-table__cover-cell">
        <div className="admin-upload-table__cover-image-container">
          <img
            src={item.coverImageUrl}
            alt={`${item.name} cover`}
            className="admin-upload-table__cover-image"
            onError={e => {
              console.error(
                "Failed to load cover image from URL:",
                item.coverImageUrl
              );
              // Fallback to input field if image fails to load
              e.currentTarget.style.display = "none";
            }}
          />
          <button
            className="admin-upload-table__cover-remove-btn"
            onClick={handleRemoveClick}
            aria-label="Remove cover image"
          >
            <MuzaIcon
              iconName="Close"
              className="admin-upload-table__remove-icon"
            />
          </button>
        </div>
      </div>
    );
  }

  // Show input field for manual URL entry (similar to DataSourceCell)
  return (
    <div className="admin-upload-table__cover-cell">
      <div
        className={`admin-upload-table__cover-input-wrapper ${!item.hasValidCover && !item.isLookingUp ? "admin-upload-table__cover-input-wrapper--error" : ""}`}
      >
        <input
          type="text"
          placeholder="Img URL"
          value={inputValue}
          onChange={handleInputChange}
          className="admin-upload-table__cover-url-input"
        />
      </div>
    </div>
  );
};

export default CoverCell;
