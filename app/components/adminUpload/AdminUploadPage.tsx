import React from "react";
import AdminUploadHeader from "./AdminUploadHeader";
import AdminFileDropArea from "./AdminFileDropArea";
import AdminUploadTable from "./AdminUploadTable";
import "./AdminUploadPage.scss";

interface AdminUploadPageProps {
  uploadedFiles: File[];
  selectedFiles: Set<number>;
  isScanning: boolean;
  currentPage: number;
  itemsPerPage: number;
  onFileUpload: (files: File[]) => void;
  onFileSelect: (index: number, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onCancelSelection: () => void;
  onProcessUpload: () => void;
  onCancel: () => void;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

const AdminUploadPage: React.FC<AdminUploadPageProps> = ({
  uploadedFiles,
  selectedFiles,
  isScanning,
  currentPage,
  itemsPerPage,
  onFileUpload,
  onFileSelect,
  onSelectAll,
  onCancelSelection,
  onProcessUpload,
  onCancel,
  onPageChange,
  onItemsPerPageChange,
}) => {
  const totalFiles = uploadedFiles.length;
  const hasSelectedFiles = selectedFiles.size > 0;

  return (
    <div className="admin-upload-page">
      <AdminUploadHeader onCancel={onCancel} />

      <div className="admin-upload-content">
        {/* Always show drag area - positioned above the table */}
        <div className="admin-upload-drop-section">
          <AdminFileDropArea
            onFileUpload={onFileUpload}
            hasFiles={uploadedFiles.length > 0}
          />
        </div>

        {/* Show table only when files are uploaded */}
        {uploadedFiles.length > 0 && (
          <div className="admin-upload-table-section">
            <AdminUploadTable
              files={uploadedFiles}
              selectedFiles={selectedFiles}
              isScanning={isScanning}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              totalFiles={totalFiles}
              hasSelectedFiles={hasSelectedFiles}
              onFileSelect={onFileSelect}
              onSelectAll={onSelectAll}
              onCancelSelection={onCancelSelection}
              onProcessUpload={onProcessUpload}
              onPageChange={onPageChange}
              onItemsPerPageChange={onItemsPerPageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUploadPage;
