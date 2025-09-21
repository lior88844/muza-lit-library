import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { AdminUploadPage, type UploadItem } from "~/components/adminUpload";
import { extractAlbumMetadataSimple } from "~/lib/utils/simpleFlacMetadata";
import { lookupAlbum } from "~/components/adminUpload/services/albumLookup";

import "../styles/scrollbar.scss";
import "../styles/variables.scss";
import "../styles/main.scss";

const isFlacFile = (file: File): boolean => {
  const fileName = file.name.toLowerCase();
  return fileName.endsWith(".flac");
};

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

type ErrorCode = keyof typeof ERROR_CODES;

export default function AdminUpload() {
  const navigate = useNavigate();
  const [uploadedItems, setUploadedItems] = useState<UploadItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [isScanning, setIsScanning] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleFileUpload = useCallback(async (files: File[]) => {
    const newItems: UploadItem[] = [];

    // Filter for FLAC files only
    const flacFiles = files.filter(isFlacFile);

    // Group all files by folder path to track folders with no FLAC files
    const allFolderMap = new Map<string, File[]>();
    const flacFolderMap = new Map<string, File[]>();

    // First, group all files by folder
    files.forEach(file => {
      const path = file.webkitRelativePath || file.name;
      const folderPath = path.includes("/")
        ? path.substring(0, path.lastIndexOf("/"))
        : "root";

      if (!allFolderMap.has(folderPath)) {
        allFolderMap.set(folderPath, []);
      }
      allFolderMap.get(folderPath)!.push(file);
    });

    // Then, group FLAC files by folder
    flacFiles.forEach(file => {
      const path = file.webkitRelativePath || file.name;
      const folderPath = path.includes("/")
        ? path.substring(0, path.lastIndexOf("/"))
        : "root";

      if (!flacFolderMap.has(folderPath)) {
        flacFolderMap.set(folderPath, []);
      }
      flacFolderMap.get(folderPath)!.push(file);
    });

    // Create items for folders with FLAC files
    for (const [path, folderFiles] of Array.from(flacFolderMap.entries())) {
      const totalSize = folderFiles.reduce((sum, file) => sum + file.size, 0);
      const folderName =
        path === "root" ? "Music Folder" : path.split("/").pop() || path;

      // Check if this folder has non-FLAC files that were skipped
      const allFilesInFolder = allFolderMap.get(path) || [];
      const skippedCount = allFilesInFolder.length - folderFiles.length;

      const newItem: UploadItem = {
        id: `folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: folderName,
        type: "folder",
        size: totalSize,
        files: folderFiles,
        path,
        errorCode: skippedCount > 0 ? ("1002" as const) : undefined,
        isLookingUp: skippedCount === 0, // Only look up if there are no errors
      };

      newItems.push(newItem);
    }

    // Create error items for folders with no FLAC files
    Array.from(allFolderMap.entries()).forEach(([path, allFiles]) => {
      if (!flacFolderMap.has(path)) {
        const folderName =
          path === "root" ? "Music Folder" : path.split("/").pop() || path;

        newItems.push({
          id: `error-folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: folderName,
          type: "folder",
          size: 0,
          files: [],
          path,
          errorCode: "1001" as const,
        });
      }
    });

    setUploadedItems(prev => [...prev, ...newItems]);
    setIsScanning(true);

    // Simulate scanning process
    setTimeout(() => {
      setIsScanning(false);
    }, 2000);

    // Process metadata extraction and album lookup for each valid folder
    for (const item of newItems) {
      if (item.files.length > 0 && !item.errorCode) {
        try {
          // Extract metadata from the folder
          const metadata = extractAlbumMetadataSimple(item.files);

          if (metadata) {
            // Update item with metadata
            setUploadedItems(prev =>
              prev.map(prevItem =>
                prevItem.id === item.id ? { ...prevItem, metadata } : prevItem
              )
            );

            // Look up album in backend
            const albumLookup = await lookupAlbum(metadata);

            // Update item with lookup result and remove loading state
            setUploadedItems(prev =>
              prev.map(prevItem =>
                prevItem.id === item.id
                  ? { ...prevItem, albumLookup, isLookingUp: false }
                  : prevItem
              )
            );
          } else {
            // Failed to extract metadata
            setUploadedItems(prev =>
              prev.map(prevItem =>
                prevItem.id === item.id
                  ? { ...prevItem, isLookingUp: false }
                  : prevItem
              )
            );
          }
        } catch (error) {
          console.error("Error processing album metadata:", error);
          // Remove loading state on error
          setUploadedItems(prev =>
            prev.map(prevItem =>
              prevItem.id === item.id
                ? { ...prevItem, isLookingUp: false }
                : prevItem
            )
          );
        }
      }
    }
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

  const handleManualIdChange = useCallback(
    (itemId: string, albumId: number | undefined) => {
      setUploadedItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, manualAlbumId: albumId } : item
        )
      );
    },
    []
  );

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
      onManualIdChange={handleManualIdChange}
    />
  );
}
