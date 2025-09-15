import React, { useMemo } from "react";
import MuzaButton from "~/controls/MuzaButton";
import MuzaIcon from "~/icons/MuzaIcon";
import "./AdminUploadTable.scss";

interface AdminUploadTableProps {
  files: File[];
  selectedFiles: Set<number>;
  isScanning: boolean;
  currentPage: number;
  itemsPerPage: number;
  totalFiles: number;
  hasSelectedFiles: boolean;
  onFileSelect: (index: number, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onCancelSelection: () => void;
  onProcessUpload: () => void;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

const AdminUploadTable: React.FC<AdminUploadTableProps> = ({
  files,
  selectedFiles,
  isScanning,
  currentPage,
  itemsPerPage,
  totalFiles,
  hasSelectedFiles,
  onFileSelect,
  onSelectAll,
  onCancelSelection,
  onProcessUpload,
  onPageChange,
  onItemsPerPageChange,
}) => {
  const paginatedFiles = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return files.slice(startIndex, endIndex);
  }, [files, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(totalFiles / itemsPerPage);
  const isAllSelected = selectedFiles.size === files.length && files.length > 0;

  const handleSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelectAll(e.target.checked);
  };

  const handleFileSelectChange =
    (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
      onFileSelect(index, e.target.checked);
    };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const renderTableRows = () => {
    if (files.length === 0) {
      return null;
    }

    return paginatedFiles.map((file, index) => {
      const globalIndex = (currentPage - 1) * itemsPerPage + index;
      const isSelected = selectedFiles.has(globalIndex);

      return (
        <tr key={globalIndex} className="admin-upload-table__row">
          <td className="admin-upload-table__cell admin-upload-table__cell--number">
            {globalIndex + 1}
          </td>
          <td className="admin-upload-table__cell admin-upload-table__cell--checkbox">
            <div
              className={`admin-upload-table__checkbox-wrapper ${isSelected ? "admin-upload-table__checkbox-wrapper--checked" : ""}`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={handleFileSelectChange(globalIndex)}
                className="admin-upload-table__checkbox"
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
              <span className="admin-upload-table__folder-name">
                {file.name}
              </span>
            )}
          </td>
          <td className="admin-upload-table__cell admin-upload-table__cell--upload">
            <div className="admin-upload-table__upload-item">
              <div className="admin-upload-table__upload-status">
                <MuzaIcon
                  iconName="Clock8"
                  className="admin-upload-table__status-icon"
                />
              </div>
              <div className="admin-upload-table__upload-content">
                <div className="admin-upload-table__upload-info">
                  <span className="admin-upload-table__percentage">0%</span>
                  <div className="admin-upload-table__size-info">
                    <span className="admin-upload-table__size">
                      -- / {formatFileSize(file.size)}
                    </span>
                  </div>
                </div>
                <div className="admin-upload-table__progress-bar">
                  <div
                    className="admin-upload-table__progress-fill"
                    style={{ width: "0%" }}
                  />
                </div>
              </div>
            </div>
          </td>
          <td className="admin-upload-table__cell admin-upload-table__cell--data-source">
            {/* Empty for now */}
          </td>
          <td className="admin-upload-table__cell admin-upload-table__cell--cover">
            {/* Empty for now */}
          </td>
          <td className="admin-upload-table__cell admin-upload-table__cell--errors">
            {/* Empty for now */}
          </td>
        </tr>
      );
    });
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

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
          {endPage < totalPages && (
            <>
              <span className="admin-upload-table__ellipsis">...</span>
              <button
                onClick={() => onPageChange(totalPages)}
                className="admin-upload-table__page-button"
              >
                {totalPages}
              </button>
            </>
          )}
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

  if (files.length === 0) {
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
          <span>of {totalFiles} rows</span>
        </div>

        {totalPages > 1 && renderPagination()}

        <div className="admin-upload-table__actions">
          <MuzaButton
            content="Cancel Selection"
            iconName="trash"
            onClick={onCancelSelection}
            disabled={!hasSelectedFiles}
            className="admin-upload-table__cancel-button"
          />
          <MuzaButton
            content="Process & Upload"
            iconName="upload"
            onClick={onProcessUpload}
            disabled={!hasSelectedFiles}
            className="admin-upload-table__process-button"
          />
        </div>
      </div>
    </div>
  );
};

export default AdminUploadTable;
