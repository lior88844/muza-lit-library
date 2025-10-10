import React, { useRef, useState, useEffect } from "react";
import MuzaIcon from "~/icons/MuzaIcon";
import type { UploadItem } from "./AdminUploadPage";

interface CoverCellProps {
  item: UploadItem;
  onCoverUpload: (itemId: string, file: File) => void;
  onCoverRemove: (itemId: string) => void;
}

const CoverCell: React.FC<CoverCellProps> = ({
  item,
  onCoverUpload,
  onCoverRemove,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Handle image URL creation and cleanup
  useEffect(() => {
    if (item.coverImage) {
      console.log("Creating object URL for cover image:", item.coverImage.name);
      const url = URL.createObjectURL(item.coverImage);
      console.log("Created URL:", url);
      setImageUrl(url);

      // Cleanup function
      return () => {
        console.log("Cleaning up URL:", url);
        URL.revokeObjectURL(url);
      };
    } else {
      setImageUrl(null);
    }
  }, [item.coverImage]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCoverRemove(item.id);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      console.log("Uploading cover image:", file.name, file.type, file.size);
      onCoverUpload(item.id, file);
    } else if (file) {
      console.warn("Invalid file type for cover image:", file.type, file.name);
      alert("Please select a valid image file (JPG, PNG, GIF, WEBP, etc.)");
    }
  };

  // Don't show anything for items with critical error 1001 (no FLAC files)
  if (item.errorCode === "1001") {
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

  // Show manually uploaded cover image
  if (item.coverImage && imageUrl) {
    return (
      <div className="admin-upload-table__cover-cell">
        <div className="admin-upload-table__cover-image-container">
          <img
            src={imageUrl}
            alt={`${item.name} cover`}
            className="admin-upload-table__cover-image"
            onError={e => {
              console.error("Failed to load cover image:", e);
              // Fallback to upload button if image fails to load
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

  // Show upload button if no cover was found
  return (
    <div className="admin-upload-table__cover-cell">
      <button
        className="admin-upload-table__cover-upload-btn"
        onClick={handleUploadClick}
        aria-label="Upload cover image"
      >
        <MuzaIcon
          iconName="upload"
          className="admin-upload-table__upload-icon"
        />
        <span className="admin-upload-table__upload-text">Image</span>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="admin-upload-table__cover-input"
        aria-hidden="true"
      />
    </div>
  );
};

export default CoverCell;
