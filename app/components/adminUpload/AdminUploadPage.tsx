import React from "react";
import AdminUploadHeader from "./AdminUploadHeader";
import AdminFileDropArea from "./AdminFileDropArea";
import AdminUploadTable from "./AdminUploadTable";
import "./AdminUploadPage.scss";

import type { SimpleFlacMetadata } from "~/lib/utils/simpleFlacMetadata";
import type { AlbumLookupResult } from "./services/albumLookup";

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
  coverImageUrl?: string; // Manually entered cover image URL
  loadingState?: {
    status: "loading" | "loaded" | "error";
    loadedFiles: number; // how many files read from disk
    totalFiles: number; // total files in folder
    progress: number; // 0-100 percentage
  };
}

interface AdminUploadPageProps {
  uploadedItems: UploadItem[];
  selectedItems: Set<number>;
  isScanning: boolean;
  currentPage: number;
  itemsPerPage: number;
  onFileUpload: (files: File[]) => void;
  onItemSelect: (index: number, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onCancelSelection: () => void;
  onProcessUpload: () => void;
  onCancel: () => void;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  onManualIdChange: (itemId: string, albumId: number | undefined) => void;
  onCoverUrlChange: (itemId: string, url: string | undefined) => void;
}

const AdminUploadPage: React.FC<AdminUploadPageProps> = ({
  uploadedItems,
  selectedItems,
  isScanning,
  currentPage,
  itemsPerPage,
  onFileUpload,
  onItemSelect,
  onSelectAll,
  onCancelSelection,
  onProcessUpload,
  onCancel,
  onPageChange,
  onItemsPerPageChange,
  onManualIdChange,
  onCoverUrlChange,
}) => {
  const totalItems = uploadedItems.length;
  const hasSelectedItems = selectedItems.size > 0;

  return (
    <div className="admin-upload-page">
      <AdminUploadHeader onCancel={onCancel} />

      <div className="admin-upload-content">
        {/* Always show drag area - positioned above the table */}
        <div className="admin-upload-drop-section">
          <AdminFileDropArea onFileUpload={onFileUpload} />
        </div>

        {/* Show table only when items are uploaded */}
        {uploadedItems.length > 0 && (
          <div className="admin-upload-table-section">
            <AdminUploadTable
              items={uploadedItems}
              selectedItems={selectedItems}
              isScanning={isScanning}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
              hasSelectedItems={hasSelectedItems}
              onItemSelect={onItemSelect}
              onSelectAll={onSelectAll}
              onCancelSelection={onCancelSelection}
              onProcessUpload={onProcessUpload}
              onPageChange={onPageChange}
              onItemsPerPageChange={onItemsPerPageChange}
              onManualIdChange={onManualIdChange}
              onCoverUrlChange={onCoverUrlChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUploadPage;
