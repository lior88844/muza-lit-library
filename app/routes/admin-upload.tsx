import React, { useState, useCallback } from "react";
import { AdminUploadPage } from "~/components/adminUpload";

import "../styles/scrollbar.scss";
import "../styles/variables.scss";
import "../styles/main.scss";

export default function AdminUpload() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set());
  const [isScanning, setIsScanning] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleFileUpload = useCallback((files: File[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
    setIsScanning(true);

    // Simulate scanning process
    setTimeout(() => {
      setIsScanning(false);
    }, 2000);
  }, []);

  const handleFileSelect = useCallback((index: number, selected: boolean) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(index);
      } else {
        newSet.delete(index);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(
    (selected: boolean) => {
      if (selected) {
        const allIndices = Array.from(
          { length: uploadedFiles.length },
          (_, i) => i
        );
        setSelectedFiles(new Set(allIndices));
      } else {
        setSelectedFiles(new Set());
      }
    },
    [uploadedFiles.length]
  );

  const handleCancelSelection = useCallback(() => {
    setSelectedFiles(new Set());
  }, []);

  const handleProcessUpload = useCallback(() => {
    const selectedFileList = Array.from(selectedFiles).map(
      index => uploadedFiles[index]
    );
    // TODO: Process selected files
    console.log("Processing files:", selectedFileList);
  }, [selectedFiles, uploadedFiles]);

  const handleCancel = useCallback(() => {
    setUploadedFiles([]);
    setSelectedFiles(new Set());
    setIsScanning(false);
    setCurrentPage(1);
  }, []);

  return (
    <AdminUploadPage
      uploadedFiles={uploadedFiles}
      selectedFiles={selectedFiles}
      isScanning={isScanning}
      currentPage={currentPage}
      itemsPerPage={itemsPerPage}
      onFileUpload={handleFileUpload}
      onFileSelect={handleFileSelect}
      onSelectAll={handleSelectAll}
      onCancelSelection={handleCancelSelection}
      onProcessUpload={handleProcessUpload}
      onCancel={handleCancel}
      onPageChange={setCurrentPage}
      onItemsPerPageChange={setItemsPerPage}
    />
  );
}
