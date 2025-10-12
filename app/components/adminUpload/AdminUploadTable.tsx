import React, { useMemo, useState } from "react";
import MuzaButton from "~/controls/MuzaButton";
import MuzaIcon from "~/icons/MuzaIcon";
import DataSourceCell from "./DataSourceCell";
import CoverCell from "./CoverCell";
import type { SimpleFlacMetadata } from "~/lib/utils/simpleFlacMetadata";
import type { AlbumLookupResult } from "./services/albumLookup";
import "./AdminUploadTable.scss";

// Error codes and their explanations
const ERROR_CODES = {
  1001: {
    code: "1001",
    title: "All Files Invalid",
    description:
      "No FLAC files found in this folder. All files were skipped because they are not in FLAC format.",
  },
  1002: {
    code: "1002",
    title: "Partial Upload",
    description:
      "Some files were skipped because they are not in FLAC format. Only FLAC files will be processed.",
  },
} as const;

// Error Badge Component with Tooltip
const ErrorBadge: React.FC<{ errorCode: "1001" | "1002" }> = ({
  errorCode,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const errorInfo = ERROR_CODES[errorCode];

  return (
    <div
      className="admin-upload-table__error-badge-container"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className={`admin-upload-table__error-badge admin-upload-table__error-badge--${errorCode}`}
      >
        Error: {errorInfo.code}
      </div>
      {showTooltip && (
        <div className="admin-upload-table__tooltip">
          <div className="admin-upload-table__tooltip-title">
            {errorInfo.title}
          </div>
          <div className="admin-upload-table__tooltip-description">
            {errorInfo.description}
          </div>
        </div>
      )}
    </div>
  );
};

// Success Badge Component
const SuccessBadge: React.FC = () => (
  <div className="admin-upload-table__success-badge">
    <MuzaIcon iconName="Check" className="admin-upload-table__success-icon" />
    No Errors
  </div>
);

export interface UploadItem {
  id: string;
  name: string;
  type: "folder";
  size: number;
  files: File[]; // Array of files in the folder
  path: string;
  errorCode?: "1001" | "1002"; // Optional error code
  metadata?: SimpleFlacMetadata; // Extracted FLAC metadata
  albumLookup?: AlbumLookupResult; // Backend lookup result
  isLookingUp?: boolean; // Whether we're currently looking up the album
  manualAlbumId?: number; // Manually entered album ID
  loadingState?: {
    status: "loading" | "loaded" | "error";
    loadedFiles: number; // how many files read from disk
    totalFiles: number; // total files in folder
    progress: number; // 0-100 percentage
  };
}

interface AdminUploadTableProps {
  items: UploadItem[];
  selectedItems: Set<number>;
  isScanning: boolean;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  hasSelectedItems: boolean;
  onItemSelect: (index: number, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onCancelSelection: () => void;
  onProcessUpload: () => void;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  onManualIdChange: (itemId: string, albumId: number | undefined) => void;
  onCoverUpload: (itemId: string, file: File) => void;
  onCoverRemove: (itemId: string) => void;
}

const AdminUploadTable: React.FC<AdminUploadTableProps> = ({
  items,
  selectedItems,
  isScanning,
  currentPage,
  itemsPerPage,
  totalItems,
  hasSelectedItems,
  onItemSelect,
  onSelectAll,
  onCancelSelection,
  onProcessUpload,
  onPageChange,
  onItemsPerPageChange,
  onManualIdChange,
  onCoverUpload,
  onCoverRemove,
}) => {
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  }, [items, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const isAllSelected = selectedItems.size === items.length && items.length > 0;

  const handleSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelectAll(e.target.checked);
  };

  const handleItemSelectChange =
    (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
      onItemSelect(index, e.target.checked);
    };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const renderTableRows = () => {
    if (items.length === 0) {
      return null;
    }

    return paginatedItems.map((item, index) => {
      const globalIndex = (currentPage - 1) * itemsPerPage + index;
      const isSelected = selectedItems.has(globalIndex);

      return (
        <tr key={item.id} className="admin-upload-table__row">
          <td className="admin-upload-table__cell admin-upload-table__cell--number">
            {globalIndex + 1}
          </td>
          <td className="admin-upload-table__cell admin-upload-table__cell--checkbox">
            <div
              className={`admin-upload-table__checkbox-wrapper ${isSelected ? "admin-upload-table__checkbox-wrapper--checked" : ""} ${item.errorCode === "1001" ? "admin-upload-table__checkbox-wrapper--disabled" : ""}`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={handleItemSelectChange(globalIndex)}
                className="admin-upload-table__checkbox"
                disabled={item.errorCode === "1001"}
              />
              <div className="admin-upload-table__checkbox-visual">
                <MuzaIcon
                  iconName="CheckmarkSquare"
                  className="admin-upload-table__checkmark"
                />
              </div>
            </div>
          </td>
          <td className="admin-upload-table__cell admin-upload-table__cell--folder">
            {isScanning ? (
              <span className="admin-upload-table__scanning">
                ...scanning data
              </span>
            ) : (
              <div className="admin-upload-table__item-info">
                <span className="admin-upload-table__item-name">
                  {item.name}
                </span>
                <div className="admin-upload-table__item-meta">
                  <span className="admin-upload-table__file-count">
                    {item.files.length} files
                  </span>
                </div>
              </div>
            )}
          </td>
          <td className="admin-upload-table__cell admin-upload-table__cell--upload">
            <div className="admin-upload-table__upload-item">
              <div
                className={`admin-upload-table__upload-status ${
                  item.loadingState?.status === "loaded"
                    ? "admin-upload-table__upload-status--loaded"
                    : ""
                }`}
              >
                <MuzaIcon
                  iconName={
                    item.loadingState?.status === "loaded" ? "Check" : "Clock8"
                  }
                  className="admin-upload-table__status-icon"
                />
              </div>
              <div className="admin-upload-table__upload-content">
                <div className="admin-upload-table__upload-info">
                  <div className="admin-upload-table__upload-icon">
                    <MuzaIcon
                      iconName="folder"
                      className="admin-upload-table__type-icon"
                    />
                  </div>
                  {item.loadingState?.status === "loaded" && item.metadata ? (
                    <span className="admin-upload-table__album-text">
                      {item.metadata.album || "Unknown Album"} -{" "}
                      {item.metadata.albumartist ||
                        item.metadata.artist ||
                        "Unknown Artist"}
                    </span>
                  ) : (
                    <>
                      <span className="admin-upload-table__size-text">
                        {formatFileSize(item.size)}
                      </span>
                      <span className="admin-upload-table__status-text">
                        Loading
                      </span>
                      <span className="admin-upload-table__percentage">
                        {item.loadingState?.progress ?? 0}%
                      </span>
                      <div className="admin-upload-table__file-progress">
                        <span className="admin-upload-table__progress-count">
                          {item.loadingState?.loadedFiles ?? 0} /{" "}
                          {item.files.length}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                <div className="admin-upload-table__progress-bar">
                  <div
                    className="admin-upload-table__progress-fill"
                    style={{
                      width: `${item.loadingState?.progress ?? 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </td>
          <td className="admin-upload-table__cell admin-upload-table__cell--data-source">
            <DataSourceCell item={item} onManualIdChange={onManualIdChange} />
          </td>
          <td className="admin-upload-table__cell admin-upload-table__cell--cover">
            <CoverCell
              item={item}
              onCoverUpload={onCoverUpload}
              onCoverRemove={onCoverRemove}
            />
          </td>
          <td className="admin-upload-table__cell admin-upload-table__cell--errors">
            {item.errorCode ? (
              <ErrorBadge errorCode={item.errorCode} />
            ) : (
              <SuccessBadge />
            )}
          </td>
        </tr>
      );
    });
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 3;

    // Calculate the range of pages to show
    let startPage = Math.max(1, currentPage - 1);
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust startPage if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Create page buttons
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`admin-upload-table__page-button ${
            i === currentPage ? "admin-upload-table__page-button--active" : ""
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="admin-upload-table__pagination">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="admin-upload-table__nav-button"
        >
          <MuzaIcon iconName="ChevronLeft" />
          Previous
        </button>

        <div className="admin-upload-table__page-numbers">
          {pages}
          <div
            className={`admin-upload-table__ellipsis ${endPage < totalPages ? "" : "admin-upload-table__ellipsis--hidden"}`}
          >
            <MuzaIcon iconName="ellipsis" />
          </div>
        </div>

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="admin-upload-table__nav-button"
        >
          Next
          <MuzaIcon iconName="ChevronRight" />
        </button>
      </div>
    );
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="admin-upload-table">
      <div className="admin-upload-table__container">
        <table className="admin-upload-table__table">
          <thead className="admin-upload-table__head">
            <tr className="admin-upload-table__header-row">
              <th className="admin-upload-table__header admin-upload-table__header--number">
                {/* Empty header for row numbers */}
              </th>
              <th className="admin-upload-table__header admin-upload-table__header--checkbox">
                <div
                  className={`admin-upload-table__checkbox-wrapper ${isAllSelected ? "admin-upload-table__checkbox-wrapper--checked" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAllChange}
                    className="admin-upload-table__checkbox"
                  />
                  <div className="admin-upload-table__checkbox-visual">
                    <MuzaIcon
                      iconName="CheckmarkSquare"
                      className="admin-upload-table__checkmark"
                    />
                  </div>
                </div>
              </th>
              <th className="admin-upload-table__header admin-upload-table__header--folder">
                Folder
              </th>
              <th className="admin-upload-table__header admin-upload-table__header--upload">
                Upload
              </th>
              <th className="admin-upload-table__header admin-upload-table__header--data-source">
                Data Source
              </th>
              <th className="admin-upload-table__header admin-upload-table__header--cover">
                Cover
              </th>
              <th className="admin-upload-table__header admin-upload-table__header--errors">
                Errors
              </th>
            </tr>
          </thead>
          <tbody className="admin-upload-table__body">
            {renderTableRows()}
          </tbody>
        </table>
      </div>

      <div className="admin-upload-table__footer">
        <div className="admin-upload-table__info">
          <span>Show</span>
          <select
            id="items-per-page"
            value={itemsPerPage}
            onChange={e => onItemsPerPageChange(Number(e.target.value))}
            className="admin-upload-table__items-per-page"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>of {totalItems} rows</span>
        </div>

        {totalPages > 1 && renderPagination()}

        <div className="admin-upload-table__actions">
          <MuzaButton
            content="Cancel Selection"
            iconName="trash"
            onClick={onCancelSelection}
            disabled={!hasSelectedItems}
            className="admin-upload-table__cancel-button"
          />
          <MuzaButton
            content="Process & Upload"
            iconName="upload"
            onClick={onProcessUpload}
            disabled={!hasSelectedItems}
            className="admin-upload-table__process-button"
          />
        </div>
      </div>
    </div>
  );
};

export default AdminUploadTable;
