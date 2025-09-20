import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { AdminUploadPage, type UploadItem } from "~/components/adminUpload";

import "../styles/scrollbar.scss";
import "../styles/variables.scss";
import "../styles/main.scss";

export default function AdminUpload() {
  const navigate = useNavigate();
  const [uploadedItems, setUploadedItems] = useState<UploadItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [isScanning, setIsScanning] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleFileUpload = useCallback((files: File[]) => {
    const newItems: UploadItem[] = [];

    // Only handle folders - group files by their folder path
    const folderMap = new Map<string, File[]>();

    files.forEach(file => {
      // All files should have webkitRelativePath since we only accept folders
      const path = file.webkitRelativePath || file.name;
      const folderPath = path.includes("/")
        ? path.substring(0, path.lastIndexOf("/"))
        : "root";

      if (!folderMap.has(folderPath)) {
        folderMap.set(folderPath, []);
      }
      folderMap.get(folderPath)!.push(file);
    });

    // Convert to UploadItem objects for folders
    Array.from(folderMap.entries()).forEach(([path, folderFiles]) => {
      const totalSize = folderFiles.reduce((sum, file) => sum + file.size, 0);
      const folderName =
        path === "root" ? "Music Folder" : path.split("/").pop() || path;

      newItems.push({
        id: `folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: folderName,
        type: "folder",
        size: totalSize,
        files: folderFiles,
        path,
      });
    });

    setUploadedItems(prev => [...prev, ...newItems]);
    setIsScanning(true);

    // Simulate scanning process
    setTimeout(() => {
      setIsScanning(false);
    }, 2000);
  }, []);

  const handleItemSelect = useCallback((index: number, selected: boolean) => {
    setSelectedItems(prev => {
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
          { length: uploadedItems.length },
          (_, i) => i
        );
        setSelectedItems(new Set(allIndices));
      } else {
        setSelectedItems(new Set());
      }
    },
    [uploadedItems.length]
  );

  const handleCancelSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  const handleProcessUpload = useCallback(() => {
    const selectedItemList = Array.from(selectedItems).map(
      index => uploadedItems[index]
    );
    // TODO: Process selected items
    // eslint-disable-next-line no-console
    console.log("Processing items:", selectedItemList);
  }, [selectedItems, uploadedItems]);

  const handleCancel = useCallback(() => {
    setUploadedItems([]);
    setSelectedItems(new Set());
    setIsScanning(false);
    setCurrentPage(1);
    navigate("/");
  }, [navigate]);

  return (
    <AdminUploadPage
      uploadedItems={uploadedItems}
      selectedItems={selectedItems}
      isScanning={isScanning}
      currentPage={currentPage}
      itemsPerPage={itemsPerPage}
      onFileUpload={handleFileUpload}
      onItemSelect={handleItemSelect}
      onSelectAll={handleSelectAll}
      onCancelSelection={handleCancelSelection}
      onProcessUpload={handleProcessUpload}
      onCancel={handleCancel}
      onPageChange={setCurrentPage}
      onItemsPerPageChange={setItemsPerPage}
    />
  );
}
