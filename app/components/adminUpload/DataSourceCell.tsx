import React, { useState, useCallback } from "react";
import { FaSpinner } from "react-icons/fa";
import MuzaIcon from "~/icons/MuzaIcon";
import type { UploadItem } from "./AdminUploadPage";

interface DataSourceCellProps {
  item: UploadItem;
  onManualIdChange: (itemId: string, albumId: number | undefined) => void;
}

const DataSourceCell: React.FC<DataSourceCellProps> = ({
  item,
  onManualIdChange,
}) => {
  const [inputValue, setInputValue] = useState(
    item.manualAlbumId?.toString() || ""
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);

      // Parse and validate the input
      const numericValue = value ? parseInt(value, 10) : undefined;
      if (value === "" || (!isNaN(numericValue!) && numericValue! > 0)) {
        onManualIdChange(item.id, numericValue);
      }
    },
    [item.id, onManualIdChange]
  );

  // Don't show anything for items with critical error 1001 (no FLAC files)
  if (item.errorCode === "1001") {
    return <div className="admin-upload-table__data-source-loading">-</div>;
  }

  // Show loading spinner while looking up
  if (item.isLookingUp) {
    return (
      <div className="admin-upload-table__data-source-loading">
        <FaSpinner className="admin-upload-table__loading-spinner" />
      </div>
    );
  }

  // Show "ID found" badge if album was found
  if (item.albumLookup?.found) {
    return (
      <div className="admin-upload-table__data-source-found">
        <div className="admin-upload-table__id-found-badge">
          <MuzaIcon
            iconName="Check"
            className="admin-upload-table__check-icon"
          />
          ID found
        </div>
      </div>
    );
  }

  // Show input field for manual ID entry
  return (
    <div className="admin-upload-table__data-source-input">
      <div className="admin-upload-table__input-wrapper">
        <input
          type="number"
          placeholder="Type in ID"
          value={inputValue}
          onChange={handleInputChange}
          min="1"
          className="admin-upload-table__id-input"
        />
      </div>
    </div>
  );
};

export default DataSourceCell;
